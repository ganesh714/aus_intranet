import React, { useState, useEffect } from 'react';
import { FaUserCog, FaChalkboardTeacher, FaCheckSquare, FaSquare, FaFilter, FaList, FaUser } from 'react-icons/fa';
import axios from 'axios';
import './Workshops.css';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ausLogo from '../../images/aus_logo.png'; // Adjust the path as needed


const HODWorkshopManager = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'access'
    const [allWorkshops, setAllWorkshops] = useState([]);
    const [permissions, setPermissions] = useState({});
    const role = sessionStorage.getItem('userSubRoleId') || userRole || 'HOD';
    const [subRoles, setSubRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Filters
    const [facultyFilter, setFacultyFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');

    // Mock Faculty List (Should ideally be fetched)
    const [deptFaculty, setDeptFaculty] = useState([]);
    const [accessSearch, setAccessSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);
   useEffect(() => {
    const fetchSubRoles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subroles/details/${role}`);
        setSubRoles(res.data);
      } catch (err) {
        setError("Failed to fetch sub roles");
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchSubRoles();
    }
  }, [role]);
const { subRole } = subRoles || {};
const namedept = subRole?.name || "HOD";
    const loadData = () => {
        fetchWorkshops(); // Renamed for clarity
        fetchPermissions();
        fetchFaculty();
    };

    const fetchWorkshops = async () => {
        try {
            // [OPTIMIZATION] Use ID if available, else fallback to string
            const userDeptId = sessionStorage.getItem('userSubRoleId');
            const userDept = userDeptId || sessionStorage.getItem('usersubRole') || 'CSE';

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workshops`, {
                params: { dept: userDept }
            });
            console.log("Fetched Workshops:", response.data);
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

  worksheet.columns = [
    { key: "sno", width: 8 },
    { key: "academicYear", width: 18 },
    { key: "facultyId", width: 18 },
    { key: "activityName", width: 45 },
    { key: "fromDate", width: 15 },
    { key: "toDate", width: 15 },
    { key: "resourcePerson", width: 30 },
    { key: "students", width: 18 }
  ];

  const imageBuffer = await fetch(ausLogo).then(res => res.arrayBuffer());

  const imageId = workbook.addImage({
    buffer: imageBuffer,
    extension: "png"
  });

  worksheet.mergeCells("D1:F2");
  worksheet.getRow(1).height = 55;
  worksheet.getRow(2).height = 55;

  worksheet.addImage(imageId, {
    tl: { col: 2.1, row: 0.15 },
    ext: { width: 480, height: 100 }
  });

  worksheet.mergeCells("A4:H4");
  worksheet.mergeCells("A5:H5");

  worksheet.getCell("A4").value = "DEPARTMENT OF " + namedept.toUpperCase();
  worksheet.getCell("A5").value = "WORKSHOP REPORT";

  [4, 5].forEach(rowNum => {
    const cell = worksheet.getCell(`A${rowNum}`);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true, size: 13 };
    worksheet.getRow(rowNum).height = 30;
  });

  worksheet.mergeCells("F7:H7");
  const dateCell = worksheet.getCell("F7");
  dateCell.value = "Date: " + new Date().toLocaleDateString();
  dateCell.font = { bold: true, size: 11 };
  dateCell.alignment = { horizontal: "right" };

  const headerRow = worksheet.addRow([
    "S.No",
    "Academic Year",
    "Faculty ID",
    "Activity Name",
    "From Date",
    "To Date",
    "Resource Person",
    "No. of Students"
  ]);

  headerRow.font = { bold: true, size: 11 };
  headerRow.height = 32;
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true
  };

  headerRow.eachCell(cell => {
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

  displayedWorkshops.forEach((w, index) => {
    const row = worksheet.addRow({
      sno: index + 1,
      academicYear: w.academicYear,
      facultyId: w.userId,
      activityName: w.activityName,
      fromDate: w.startDate ? new Date(w.startDate).toLocaleDateString() : "",
      toDate: w.endDate ? new Date(w.endDate).toLocaleDateString() : "",
      resourcePerson: w.resourcePerson || w.coordinators || "",
      students: w.studentCount
    });

    row.eachCell(cell => {
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
  saveAs(
    new Blob([buffer]),
    "Department_Workshops_Report.xlsx"
  );
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

    // Load Permissions (Backend)
    const fetchPermissions = () => {
        // Permissions are now part of the faculty data fetched in fetchFaculty()
    };

    // --- ACCESS CONTROL ---
    const grantAccess = async (facId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-workshop-permission`, {
                id: facId,
                allowed: true
            });
            fetchFaculty(); // Refresh data
            setShowAddForm(false);
        } catch (error) {
            console.error("Error granting workshop access:", error);
            alert("Failed to grant access");
        }
    };

    const revokeAccess = async (facId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-workshop-permission`, {
                id: facId,
                allowed: false
            });
            fetchFaculty(); // Refresh data
        } catch (error) {
            console.error("Error revoking workshop access:", error);
            alert("Failed to revoke access");
        }
    };

    // --- FILTERING ---
    const displayedWorkshops = allWorkshops.filter(w => {
        if (facultyFilter !== 'All') {
            const fac = deptFaculty.find(f => f.username === facultyFilter);
            if (!fac || w.userId !== fac.id) return false;
        }
        if (yearFilter !== 'All' && w.academicYear !== yearFilter) return false;
        return true;
    });

    const activeApprovers = deptFaculty.filter(f => f.permissions?.canManageWorkshops);

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>Department Workshops</h2>
            </div>

            <div className="achievements-tabs">
                <button
                    className={`std-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaList /> Overview
                </button>
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
                        <div className="toolbar-text">All Faculty Workshops</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                className="std-select"
                                style={{ width: '180px' }}
                                value={facultyFilter}
                                onChange={(e) => setFacultyFilter(e.target.value)}
                            >
                                <option value="All">All Faculty</option>
                                {deptFaculty.map(f => <option key={f.id} value={f.username}>{f.username}</option>)}
                            </select>
                            <select
                                className="std-select"
                                style={{ width: '150px' }}
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="All">All Years</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                            </select>
                        </div>
                    </div>

                    <div className="workshops-table-container">
                        <table className="std-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Faculty ID</th>
                                    <th>Activity</th>
                                    <th>Date(s)</th>
                                    <th>Resource Person</th>
                                    <th>Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedWorkshops.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No workshops found.</td></tr>
                                ) : (
                                    displayedWorkshops.map((w, idx) => (
                                        <tr key={idx}>
                                            <td>{w.academicYear}</td>
                                            <td style={{ color: '#64748b' }}>{w.userId}</td>
                                            <td><strong>{w.activityName}</strong></td>
                                            <td>{w.startDate ? new Date(w.startDate).toLocaleDateString() : '-'} to {w.endDate ? new Date(w.endDate).toLocaleDateString() : '-'}</td>
                                            <td>{w.resourcePerson || w.coordinators}</td>
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
                            ) : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No faculty members currently have access to the Workshops module.</p>}
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
                                    .filter(f => !f.permissions?.canManageWorkshops && f.username.toLowerCase().includes(accessSearch.toLowerCase()))
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

export default HODWorkshopManager;
