import React, { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import axios from 'axios';
import '../Workshops/Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed

const DeanGuestLecturesManager = ({ userRole }) => {
    const [allGuestLectures, setAllGuestLectures] = useState([]);
    const [subRolesList, setSubRolesList] = useState([]);

    // Helper to format date as DD/MM/YYYY
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Filters
    const [yearFilter, setYearFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');

    useEffect(() => {
        loadData();
    }, [deptFilter]);

    const loadData = () => {
        fetchGuestLectures();
        fetchSubRoles();
    };

    const fetchSubRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subroles/HOD`);
            if (response.data && response.data.success) {
                setSubRolesList(response.data.subRoles);
            }
        } catch (error) {
            console.error("Error fetching subroles:", error);
        }
    };

    const fetchGuestLectures = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-guest-lectures`, {
                params: { dept: deptFilter }
            });
            setAllGuestLectures(response.data.guestLectures || []);
        } catch (error) {
            console.error("Error loading guest lectures:", error);
        }
    };

    const generateExcelReport = async () => {
        if (displayedGuestLectures.length === 0) {
            alert("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Guest Lectures");

        const isYearFiltered = yearFilter !== 'All';
        const isDeptFiltered = deptFilter !== 'All';

        // Define column keys and widths
        const baseColumns = [
            { key: "sno", width: 8 },
            { key: "academicYear", width: 18 },
            { key: "department", width: 25 },
            { key: "topic", width: 45 },
            { key: "fromDate", width: 15 },
            { key: "toDate", width: 15 },
            { key: "resourcePerson", width: 30 },
            { key: "students", width: 18 }
        ];

        let activeColumns = baseColumns;
        if (isYearFiltered) activeColumns = activeColumns.filter(c => c.key !== 'academicYear');
        if (isDeptFiltered) activeColumns = activeColumns.filter(c => c.key !== 'department');

        worksheet.columns = activeColumns;

        // Load logo
        const imageBuffer = await fetch(ausLogo).then(res => res.arrayBuffer());
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: "png"
        });

        const colCount = activeColumns.length;
        const centerCol = Math.floor(colCount / 2);
        
        worksheet.addImage(imageId, {
            tl: { nativeCol: centerCol, nativeColOff: 0, nativeRow: 0, nativeRowOff: 47625 },
            ext: { width: 486, height: 75 },
            editAs: 'oneCell'
        });

        for (let r = 1; r <= 4; r++) {
            worksheet.getRow(r).height = 20;
        }

        // Title rows
        const lastColLetter = String.fromCharCode(64 + colCount);
        worksheet.mergeCells(`A5:${lastColLetter}5`);
        worksheet.mergeCells(`A6:${lastColLetter}6`);

        let deptTitle = "ALL DEPARTMENTS";
        if (isDeptFiltered) {
            const matchedRole = subRolesList.find(r => r._id === deptFilter || r.code === deptFilter || r.name === deptFilter);
            deptTitle = matchedRole ? matchedRole.name.toUpperCase() : deptFilter.toUpperCase();
        }

        worksheet.getCell("A5").value = "DEPARTMENT OF " + deptTitle;
        worksheet.getCell("A6").value = "GUEST LECTURES REPORT";
        
        let headerLabels = [];
        if (isYearFiltered) headerLabels.push("Academic Year : " + yearFilter);
        if (isDeptFiltered) headerLabels.push("Department : " + deptTitle);

        if (headerLabels.length > 0) {
            worksheet.getCell("A7").value = headerLabels.join(" | ");
            worksheet.getCell("A7").font = { bold: true, size: 10 };
            worksheet.getCell("A7").alignment = { horizontal: "left", vertical: "middle" };
        }
        worksheet.getCell(`${lastColLetter}7`).value = "Date: " + formatDate(new Date());

        [5, 6].forEach(rowNum => {
            const row = worksheet.getRow(rowNum);
            row.height = 32;
            const cell = worksheet.getCell(`A${rowNum}`);
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.font = { bold: true, size: rowNum === 5 ? 15 : 13 };
        });

        worksheet.getCell(`${lastColLetter}7`).alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell(`${lastColLetter}7`).font = { bold: true, size: 10 };

        const headerRow = worksheet.getRow(8);
        const headers = [
            "S.No",
            "Academic Year",
            "Department",
            "Guest Lecture Topic",
            "From Date",
            "To Date",
            "Resource Person / Instructor",
            "No. of Students Participated"
        ];
        
        let activeHeaders = headers;
        if (isYearFiltered) activeHeaders = activeHeaders.filter(h => h !== "Academic Year");
        if (isDeptFiltered) activeHeaders = activeHeaders.filter(h => h !== "Department");

        headerRow.values = activeHeaders;
        headerRow.font = { bold: true, size: 11 };
        headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        headerRow.height = 32;
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };
            cell.border = {
                top: { style: "medium" },
                left: { style: "thin" },
                bottom: { style: "medium" },
                right: { style: "thin" }
            };
        });

        displayedGuestLectures.forEach((w, index) => {
            const rowData = {
                sno: index + 1,
                academicYear: w.academicYear,
                department: w.dept?.name || w.dept || "",
                topic: w.topic,
                fromDate: formatDate(w.startDate),
                toDate: formatDate(w.endDate),
                resourcePerson: w.resourcePerson || "",
                students: w.studentCount
            };
            
            if (isYearFiltered) delete rowData.academicYear;
            if (isDeptFiltered) delete rowData.department;

            const dataRow = worksheet.addRow(rowData);
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
                cell.alignment = { vertical: "middle", wrapText: true };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = isDeptFiltered ? `Guest_Lectures_Report_${deptTitle}.xlsx` : "All_Departments_Guest_Lectures_Report.xlsx";
        saveAs(new Blob([buffer]), fileName);
    };

    const displayedGuestLectures = allGuestLectures.filter(w => {
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>All Departments Guest Lectures</h2>
            </div>

            <div className="achievements-toolbar" style={{ marginTop: '20px' }}>
                <div className="toolbar-text">Guest Lectures Overview</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        className="std-select"
                        style={{ width: '220px' }}
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="All">All Departments</option>
                        {subRolesList.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>

                    <select
                        className="std-select"
                        style={{ width: '150px' }}
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="All">All Years</option>
                        {[...new Set(allGuestLectures.map(w => w.academicYear))]
                            .filter(Boolean)
                            .sort((a, b) => b.localeCompare(a))
                            .map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))
                        }
                    </select>
                </div>
            </div>

            <div className="workshops-table-container">
                <table className="std-table">
                    <thead>
                        <tr>
                            <th>Academic Year</th>
                            <th>Department</th>
                            <th>Topic</th>
                            <th>Date(s)</th>
                            <th>Resource Person</th>
                            <th>Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedGuestLectures.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No guest lectures found.</td></tr>
                        ) : (
                            displayedGuestLectures.map((w, idx) => (
                                <tr key={idx}>
                                    <td>{w.academicYear}</td>
                                    <td>{w.dept?.name || w.dept || '-'}</td>
                                    <td><strong>{w.topic}</strong></td>
                                    <td>{formatDate(w.startDate)} to {formatDate(w.endDate)}</td>
                                    <td>{w.resourcePerson}</td>
                                    <td>{w.studentCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100px" }}>
                <button className="std-btn" onClick={generateExcelReport}>
                    Generate Report
                </button>
            </div>
        </div>
    );
};

export default DeanGuestLecturesManager;
