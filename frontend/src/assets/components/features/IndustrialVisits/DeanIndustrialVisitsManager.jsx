import React, { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import axios from 'axios';
import '../Workshops/Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed

const DeanIndustrialVisitsManager = ({ userRole }) => {
    const [allVisits, setAllVisits] = useState([]);
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
        fetchVisits();
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

    const fetchVisits = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-industrial-visits`, {
                params: { dept: deptFilter }
            });
            setAllVisits(response.data.industrialVisits || []);
        } catch (error) {
            console.error("Error loading industrial visits:", error);
        }
    };

    const generateExcelReport = async () => {
        if (displayedVisits.length === 0) {
            alert("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Industrial Visits");

        const isYearFiltered = yearFilter !== 'All';
        const isDeptFiltered = deptFilter !== 'All';

        // Define column keys and widths
        const baseColumns = [
            { key: "sno", width: 8 },
            { key: "academicYear", width: 18 },
            { key: "department", width: 25 },
            { key: "semester", width: 12 },
            { key: "classSection", width: 15 },
            { key: "industryName", width: 35 },
            { key: "place", width: 25 },
            { key: "visitDate", width: 20 },
            { key: "studentsCount", width: 20 }
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
            tl: { nativeCol: centerCol - 1, nativeColOff: 0, nativeRow: 0, nativeRowOff: 47625 },
            ext: { width: 486, height: 75 },
            editAs: 'oneCell'
        });

        for (let r = 1; r <= 4; r++) {
            worksheet.getRow(r).height = 20;
        }

        const lastColLetter = String.fromCharCode(64 + colCount);
        worksheet.mergeCells(`A5:${lastColLetter}5`);
        worksheet.mergeCells(`A6:${lastColLetter}6`);

        let deptTitle = "ALL DEPARTMENTS";
        if (isDeptFiltered) {
            const matchedRole = subRolesList.find(r => r._id === deptFilter || r.code === deptFilter || r.name === deptFilter);
            deptTitle = matchedRole ? matchedRole.name.toUpperCase() : deptFilter.toUpperCase();
        }

        worksheet.getCell("A5").value = isDeptFiltered ? "DEPARTMENT OF " + deptTitle : "ALL DEPARTMENTS";
        worksheet.getCell("A6").value = "INDUSTRIAL VISITS REPORT";
        
        let headerLabels = [];
        if (isYearFiltered) headerLabels.push("Academic Year : " + yearFilter);

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
            "Semester",
            "Class/Section",
            "Name of the Industry Visited",
            "Place of Visit",
            "Dates(s) of Visit",
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

        displayedVisits.forEach((w, index) => {
            const rowData = {
                sno: index + 1,
                academicYear: w.academicYear,
                department: w.dept?.name || w.dept || "",
                semester: w.semester,
                classSection: w.classSection,
                industryName: w.industryName,
                place: w.place,
                visitDate: formatDate(w.startDate) + (w.endDate ? " to " + formatDate(w.endDate) : ""),
                studentsCount: w.studentsCount
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
        const fileName = isDeptFiltered ? `Industrial_Visits_Report_${deptTitle}.xlsx` : "All_Departments_Industrial_Visits_Report.xlsx";
        saveAs(new Blob([buffer]), fileName);
    };

    const displayedVisits = allVisits.filter(w => {
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>All Departments Industrial Visits</h2>
            </div>

            <div className="achievements-toolbar" style={{ marginTop: '20px' }}>
                <div className="toolbar-text">Industrial Visits Overview</div>
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
                        {[...new Set(allVisits.map(w => w.academicYear))]
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
                            <th>Semester</th>
                            <th>Class/Section</th>
                            <th>Industry</th>
                            <th>Place</th>
                            <th>Date(s)</th>
                            <th>Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedVisits.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No industrial visits found.</td></tr>
                        ) : (
                            displayedVisits.map((w, idx) => (
                                <tr key={idx}>
                                    <td>{w.academicYear}</td>
                                    <td>{w.dept?.name || w.dept || '-'}</td>
                                    <td>{w.semester}</td>
                                    <td>{w.classSection}</td>
                                    <td><strong>{w.industryName}</strong></td>
                                    <td>{w.place}</td>
                                    <td>{formatDate(w.startDate)} {w.endDate ? ` to ${formatDate(w.endDate)}` : ''}</td>
                                    <td>{w.studentsCount}</td>
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

export default DeanIndustrialVisitsManager;
