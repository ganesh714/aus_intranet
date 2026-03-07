import React, { useState, useEffect } from 'react';
import { FaUserCog, FaList, FaUser } from 'react-icons/fa';
import axios from 'axios';
import '../Workshops/Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed

const HODIndustrialVisitsManager = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'access'
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

    // Faculty List
    const [deptFaculty, setDeptFaculty] = useState([]);
    const [accessSearch, setAccessSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        fetchVisits();
        fetchFaculty();
        fetchSubRoles();
    };

    const fetchSubRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subroles/all-subroles`);
            if (response.data && response.data.success) {
                setSubRolesList(response.data.subRoles);
            }
        } catch (error) {
            console.error("Error fetching subroles for Excel report:", error);
        }
    };

    const fetchVisits = async () => {
        try {
            const userDeptId = sessionStorage.getItem('userSubRoleId');
            const userDept = userDeptId || sessionStorage.getItem('usersubRole') || 'CSE';

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-industrial-visits`, {
                params: { dept: userDept }
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

        const isFiltered = yearFilter !== 'All';

        // Define column keys and widths
        const baseColumns = [
            { key: "sno", width: 8 },
            { key: "academicYear", width: 18 },
            { key: "semester", width: 12 },
            { key: "classSection", width: 25 },
            { key: "industryName", width: 35 },
            { key: "placeOfVisit", width: 25 },
            { key: "dates", width: 25 },
            { key: "students", width: 18 }
        ];

        worksheet.columns = isFiltered 
            ? baseColumns.filter(c => c.key !== 'academicYear')
            : baseColumns;

        // Load logo
        const imageBuffer = await fetch(ausLogo).then(res => res.arrayBuffer());
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: "png"
        });

        // Center the logo using native EMU offsets
        // Base width ≈ 1202px (8 cols). Image = 486px. Center = (1202-486)/2 = 358px.
        // Filtered width ≈ 1067px (7 cols). Image = 486px. Center = (1067-486)/2 = 290px.
        const logoConfig = isFiltered 
            ? { nativeCol: 2, nativeColOff: 1338262, nativeRow: 0, nativeRowOff: 47625 } // Col C (index 2) + 140.5px
            : { nativeCol: 3, nativeColOff: 733425, nativeRow: 0, nativeRowOff: 47625 }; // Col D (index 3) + 77px

        worksheet.addImage(imageId, {
            tl: logoConfig,
            ext: { width: 486, height: 75 },
            editAs: 'oneCell'
        });

        for (let r = 1; r <= 4; r++) {
            worksheet.getRow(r).height = 20;
        }

        // Title rows
        const lastCol = isFiltered ? "G" : "H";
        worksheet.mergeCells(`A5:${lastCol}5`);
        worksheet.mergeCells(`A6:${lastCol}6`);

        const userRoleCode = sessionStorage.getItem('usersubRole') || 'IT';
        const matchedRole = subRolesList.find(r =>
            r.code?.toUpperCase() === userRoleCode.toUpperCase() ||
            r.displayName?.toUpperCase() === userRoleCode.toUpperCase()
        );
        const userDept = matchedRole ? matchedRole.name : userRoleCode;

        worksheet.getCell("A5").value = "DEPARTMENT OF " + userDept.toUpperCase();
        worksheet.getCell("A6").value = "INDUSTRIAL VISITS REPORT";
        
        // Academic Year on left, Date on right
        if (isFiltered) {
            worksheet.getCell("A7").value = "Academic Year : " + yearFilter;
            worksheet.getCell("A7").font = { bold: true, size: 10 };
            worksheet.getCell("A7").alignment = { horizontal: "left", vertical: "middle" };
        }
        worksheet.getCell(`${lastCol}7`).value = "Date: " + formatDate(new Date());

        [5, 6].forEach(rowNum => {
            const row = worksheet.getRow(rowNum);
            row.height = 32;
            const cell = worksheet.getCell(`A${rowNum}`);
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.font = { bold: true, size: rowNum === 5 ? 15 : 13 };
        });

        worksheet.getCell(`${lastCol}7`).alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell(`${lastCol}7`).font = { bold: true, size: 10 };

        // Table headers – starting at row 8
        const headerRow = worksheet.getRow(8);
        const headers = [
            "S.No",
            "Academic Year",
            "Semester",
            "Class/ Section",
            "Name of the Industry Visited",
            "Place of Visit",
            "Dates(s) of Visit",
            "No. of Students Participated"
        ];
        headerRow.values = isFiltered ? headers.filter(h => h !== "Academic Year") : headers;
        headerRow.font = { bold: true, size: 11 };
        headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        headerRow.height = 32;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFDDDDDD" }
            };
            cell.border = {
                top: { style: "medium" },
                left: { style: "thin" },
                bottom: { style: "medium" },
                right: { style: "thin" }
            };
        });

        // Data rows
        displayedVisits.forEach((w, index) => {
            const rowData = {
                sno: index + 1,
                academicYear: w.academicYear,
                semester: w.semester,
                classSection: w.classSection,
                industryName: w.industryName,
                placeOfVisit: w.placeOfVisit,
                dates: `${formatDate(w.startDate)} to ${formatDate(w.endDate)}`,
                students: w.studentCount
            };

            if (isFiltered) delete rowData.academicYear;
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
        saveAs(new Blob([buffer]), "Department_Industrial_Visits_Report.xlsx");
    };

    const fetchFaculty = async () => {
        try {
            const userDeptId = sessionStorage.getItem('userSubRoleId');
            const userDept = userDeptId || sessionStorage.getItem('usersubRole') || 'CSE';

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-dept-faculty`, {
                params: { dept: userDept }
            });
            setDeptFaculty(response.data.faculty || []);
        } catch (error) {
            console.error("Error fetching faculty:", error);
        }
    };

    // --- ACCESS CONTROL ---
    const grantAccess = async (facId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-industrial-visit-permission`, {
                id: facId,
                allowed: true
            });
            fetchFaculty(); // Refresh data
            setShowAddForm(false);
        } catch (error) {
            console.error("Error granting access:", error);
            alert("Failed to grant access");
        }
    };

    const revokeAccess = async (facId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-industrial-visit-permission`, {
                id: facId,
                allowed: false
            });
            fetchFaculty(); // Refresh data
        } catch (error) {
            console.error("Error revoking access:", error);
            alert("Failed to revoke access");
        }
    };

    // --- FILTERING ---
    const displayedVisits = allVisits.filter(w => {
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    const activeApprovers = deptFaculty.filter(f => f.permissions?.canManageIndustrialVisits);

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>Department Industrial Visits</h2>
            </div>

            <div className="achievements-tabs">
                {/* 
                <button
                    className={`std-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaList /> Overview
                </button>
                */}
                <button
                    className={`std-tab-btn ${activeTab === 'access' ? 'active' : ''}`}
                    onClick={() => setActiveTab(activeTab === 'access' ? 'overview' : 'access')}
                >
                    <FaUserCog /> {activeTab === 'access' ? 'Close Access Control' : 'Access Control'}
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    <div className="achievements-toolbar">
                        <div className="toolbar-text">All Faculty Industrial Visits</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
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
                                    <th>Sem</th>
                                    <th>Class/Section</th>
                                    <th>Industry</th>
                                    <th>Place</th>
                                    <th>Date(s)</th>
                                    <th>Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedVisits.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No industrial visits found.</td></tr>
                                ) : (
                                    displayedVisits.map((w, idx) => (
                                        <tr key={idx}>
                                            <td>{w.academicYear}</td>
                                            <td>{w.semester || '-'}</td>
                                            <td>{w.classSection}</td>
                                            <td><strong>{w.industryName}</strong></td>
                                            <td>{w.placeOfVisit}</td>
                                            <td>{formatDate(w.startDate)} to {formatDate(w.endDate)}</td>
                                            <td>{w.studentCount || '-'}</td>
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
                </>

            )}

            {/* ACCESS CONTROL TAB */}
            {activeTab === 'access' && (
                <div className="permission-manager" style={{ marginTop: '20px' }}>
                    <div className="pm-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', color: '#1e293b' }}>Authorized Faculty ({activeApprovers.length})</h3>
                        <button className="std-btn" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel Adding' : '+ Grant Access'}
                        </button>
                    </div>

                    {!showAddForm && (
                        <div className="faculty-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeApprovers.length > 0 ? (
                                activeApprovers.map(fac => (
                                    <div key={fac.id} className="user-result-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaUser style={{ color: '#94a3b8' }} />
                                            <b>{fac.username}</b>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>({fac.id})</span>
                                        </span>
                                        <button className="std-btn-sm std-btn-danger" onClick={() => revokeAccess(fac.id)}>
                                            Revoke Access
                                        </button>
                                    </div>
                                ))
                            ) : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No faculty members currently have access.</p>}
                        </div>
                    )}

                    {showAddForm && (
                        <div className="user-picker-box" style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <input
                                type="text"
                                className="std-input"
                                placeholder="Search faculty..."
                                value={accessSearch}
                                onChange={e => setAccessSearch(e.target.value)}
                                autoFocus
                                style={{ marginBottom: '10px' }}
                            />
                            <div className="user-results-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {deptFaculty
                                    .filter(f => !f.permissions?.canManageIndustrialVisits && f.username.toLowerCase().includes(accessSearch.toLowerCase()))
                                    .map(fac => (
                                        <div key={fac.id} onClick={() => grantAccess(fac.id)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', backgroundColor: 'white' }}>
                                            <span><b>{fac.username}</b> ({fac.id})</span>
                                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+ Grant</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default HODIndustrialVisitsManager;
