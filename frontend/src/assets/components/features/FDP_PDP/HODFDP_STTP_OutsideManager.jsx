import React, { useState, useEffect } from 'react';
import { FaUserCog, FaList, FaUser } from 'react-icons/fa';
import axios from 'axios';
import '../Workshops/Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed

const HODFDP_STTP_OutsideManager = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'access'
    const [allRecords, setAllRecords] = useState([]);
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
        fetchRecords();
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

    const fetchRecords = async () => {
        try {
            const userDeptId = sessionStorage.getItem('userSubRoleId');
            const userDept = userDeptId || sessionStorage.getItem('usersubRole') || 'CSE';

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-fdp-sttp-attended`, {
                params: { dept: userDept }
            });
            setAllRecords(response.data.records || []);
        } catch (error) {
            console.error("Error loading FDP/STTP Outside records:", error);
        }
    };

    const generateExcelReport = async () => {
        if (displayedRecords.length === 0) {
            alert("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("FDP STTP Outside");

        // Define column keys and widths
        worksheet.columns = [
            { key: "sno", width: 8 },
            { key: "academicYear", width: 18 },
            { key: "facultyName", width: 25 },
            { key: "eventName", width: 45 },
            { key: "dates", width: 25 },
            { key: "duration", width: 15 },
            { key: "organisedBy", width: 35 }
        ];

        // Load logo
        const imageBuffer = await fetch(ausLogo).then(res => res.arrayBuffer());
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: "png"
        });

        // Center the logo using native EMU offsets
        // Total sheet width ≈ 1233px (7 cols). Image = 486x75px.
        // Center start = (1233 - 486) / 2 = 373.5px → 373px → Column D (index 3) + 1px offset.
        // EMU conversion: 1px × 9525 = 9525 EMU, 5px top margin = 47625 EMU
        worksheet.addImage(imageId, {
            tl: { nativeCol: 3, nativeColOff: 9525, nativeRow: 0, nativeRowOff: 47625 },
            ext: { width: 486, height: 75 },
            editAs: 'oneCell'
        });

        for (let r = 1; r <= 4; r++) {
            worksheet.getRow(r).height = 20;
        }

        // Title rows
        worksheet.mergeCells("A5:G5");
        worksheet.mergeCells("A6:G6");

        const userRoleCode = sessionStorage.getItem('usersubRole') || 'IT';
        const matchedRole = subRolesList.find(r =>
            r.code?.toUpperCase() === userRoleCode.toUpperCase() ||
            r.displayName?.toUpperCase() === userRoleCode.toUpperCase()
        );
        const userDept = matchedRole ? matchedRole.name : userRoleCode;

        worksheet.getCell("A5").value = "DEPARTMENT OF " + userDept.toUpperCase();
        worksheet.getCell("A6").value = "FDP / STTP (≥ 6 Days) ATTENDED OUTSIDE THE INSTITUTE REPORT";
        worksheet.getCell("G7").value = "Date: " + formatDate(new Date());

        [5, 6].forEach(rowNum => {
            const row = worksheet.getRow(rowNum);
            row.height = 32;
            const cell = worksheet.getCell(`A${rowNum}`);
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true
            };
            cell.font = {
                bold: true,
                size: rowNum === 5 ? 15 : 13
            };
        });

        worksheet.getCell("G7").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("G7").font = { bold: true, size: 10 };

        // Table headers – starting at row 8
        const headerRow = worksheet.getRow(8);
        headerRow.values = [
            "S.No",
            "Academic Year",
            "Name of the Faculty",
            "Name of the FDP/STTP attended",
            "Dates",
            "Duration (No. of days)",
            "Organised by"
        ];
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
        displayedRecords.forEach((w, index) => {
            const dataRow = worksheet.addRow({
                sno: index + 1,
                academicYear: w.academicYear,
                facultyName: w.facultyName || w.userId,
                eventName: w.title,
                dates: `${formatDate(w.startDate)} \n to \n${formatDate(w.endDate)}`,
                duration: w.durationDays,
                organisedBy: w.organizedBy
            });

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
        saveAs(new Blob([buffer]), "Department_FDP_STTP_Outside_Report.xlsx");
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-fdp-sttp-permission`, {
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-fdp-sttp-permission`, {
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
    const displayedRecords = allRecords.filter(w => {
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    const activeApprovers = deptFaculty.filter(f => f.permissions?.canManageFdpSttp);

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>Department FDP/STTP (Outside)</h2>
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
                    onClick={() => setActiveTab('access')}
                >
                    <FaUserCog /> Access Control
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    <div className="achievements-toolbar">
                        <div className="toolbar-text">All Faculty FDP/STTP Attended Outside</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                className="std-select"
                                style={{ width: '150px' }}
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="All">All Years</option>
                                {[...new Set(allRecords.map(w => w.academicYear))]
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
                                    <th>Faculty Name</th>
                                    <th>FDP/STTP Name</th>
                                    <th>Date(s)</th>
                                    <th>Duration</th>
                                    <th>Organised by</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRecords.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No FDP/STTP records found.</td></tr>
                                ) : (
                                    displayedRecords.map((w, idx) => (
                                        <tr key={idx}>
                                            <td>{w.academicYear}</td>
                                            <td>{w.facultyName}</td>
                                            <td><strong>{w.title}</strong></td>
                                            <td>{formatDate(w.startDate)} to {formatDate(w.endDate)}</td>
                                            <td>{w.durationDays} Days</td>
                                            <td>{w.organizedBy}</td>
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
                                    .filter(f => !f.permissions?.canManageFdpSttp && f.username.toLowerCase().includes(accessSearch.toLowerCase()))
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

export default HODFDP_STTP_OutsideManager;
