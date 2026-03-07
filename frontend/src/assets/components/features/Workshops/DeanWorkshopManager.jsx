import React, { useState, useEffect } from 'react';
import { FaFilter, FaList } from 'react-icons/fa';
import axios from 'axios';
import './Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed

const DeanWorkshopManager = ({ userRole }) => {
    const [allWorkshops, setAllWorkshops] = useState([]);
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
    }, [deptFilter]); // Reload when department changes

    const loadData = () => {
        fetchWorkshops(); 
        fetchSubRoles(); 
    };

    const fetchSubRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subroles/HOD`);
            if (response.data && response.data.success) {
                setSubRolesList(response.data.subRoles);
            }
        } catch (error) {
            console.error("Error fetching subroles for filtering:", error);
        }
    };

    const fetchWorkshops = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workshops`, {
                params: { dept: deptFilter }
            });
            setAllWorkshops(response.data.workshops || []);
        } catch (error) {
            console.error("Error loading workshops:", error);
        }
    };

    const generateExcelReport = async () => {
        if (displayedWorkshops.length === 0) {
            alert("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Workshops");

        const isYearFiltered = yearFilter !== 'All';
        const isDeptFiltered = deptFilter !== 'All';

        // Define column keys and widths
        const baseColumns = [
            { key: "sno", width: 8 },
            { key: "academicYear", width: 18 },
            { key: "department", width: 25 }, // Dean view adds department
            { key: "activityName", width: 45 },
            { key: "fromDate", width: 15 },
            { key: "toDate", width: 15 },
            { key: "resourcePerson", width: 30 },
            { key: "students", width: 18 },
            { key: "contactHours", width: 18 }
        ];

        // Filter out columns based on active filters
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

        // Center the logo using native EMU offsets
        // Re-calulating based on column count
        const colCount = activeColumns.length;
        // Approximation: center index is colCount / 2
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
        worksheet.getCell("A6").value = "WORKSHOP CONDUCTED";
        
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

        // Table headers starting at row 8
        const headerRow = worksheet.getRow(8);
        const headers = [
            "S.No",
            "Academic Year",
            "Department",
            "Name of the Workshop",
            "From Date",
            "To Date",
            "Resource Person/Instructor",
            "No. of Students Participated",
            "Contact Hours"
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

        // Data rows
        displayedWorkshops.forEach((w, index) => {
            const rowData = {
                sno: index + 1,
                academicYear: w.academicYear,
                department: w.dept?.name || w.dept || "",
                activityName: w.activityName,
                fromDate: formatDate(w.startDate),
                toDate: formatDate(w.endDate),
                resourcePerson: w.resourcePerson || w.coordinators || "",
                students: w.studentCount,
                contactHours: w.contactHours || ""
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
                cell.alignment = { vertical: "middle" };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = isDeptFiltered ? `Workshop_Report_${deptTitle}.xlsx` : "All_Departments_Workshops_Report.xlsx";
        saveAs(new Blob([buffer]), fileName);
    };

    // --- FILTERING ---
    const displayedWorkshops = allWorkshops.filter(w => {
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>All Departments Workshops</h2>
            </div>

            <div className="achievements-toolbar" style={{ marginTop: '20px' }}>
                <div className="toolbar-text">Workshops Overview</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Dept Filter */}
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

                    {/* Year Filter */}
                    <select
                        className="std-select"
                        style={{ width: '150px' }}
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="All">All Years</option>
                        {[...new Set(allWorkshops.map(w => w.academicYear))]
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
                            <th>Activity</th>
                            <th>Date(s)</th>
                            <th>Resource Person</th>
                            <th>Students</th>
                            <th>Contact Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedWorkshops.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No workshops found.</td></tr>
                        ) : (
                            displayedWorkshops.map((w, idx) => (
                                <tr key={idx}>
                                    <td>{w.academicYear}</td>
                                    <td>{w.dept?.name || w.dept || '-'}</td>
                                    <td><strong>{w.activityName}</strong></td>
                                    <td>{formatDate(w.startDate)} to {formatDate(w.endDate)}</td>
                                    <td>{w.resourcePerson || w.coordinators}</td>
                                    <td>{w.studentCount || '-'}</td>
                                    <td>{w.contactHours || '-'}</td>
                                </tr>
                            ))
                        )}</tbody>
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

export default DeanWorkshopManager;
