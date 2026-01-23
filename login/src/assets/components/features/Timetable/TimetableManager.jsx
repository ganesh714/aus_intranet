import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Requires: npm install xlsx
import { FaTable, FaCloudUploadAlt, FaCalendarAlt, FaTimes, FaUserCog, FaCheck, FaBan, FaUser, FaThumbtack } from 'react-icons/fa';
import './Timetable.css';

const TimetableManager = ({ userRole, userSubRole, userId }) => {
    const [timetables, setTimetables] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Permission Management State (HOD Only)
    const [showPermissions, setShowPermissions] = useState(false);
    const [deptFaculty, setDeptFaculty] = useState([]);

    // Check Upload Permission
    const canUpload = userRole === 'HOD' || (userRole === 'Faculty' && sessionStorage.getItem('canUploadTimetable') === 'true');

    const [filters, setFilters] = useState({ year: '', section: '' });

    const [uploadForm, setUploadForm] = useState({
        targetYear: '',
        targetSection: '',
        file: null
    });

    const [viewingFile, setViewingFile] = useState(null);
    const [excelData, setExcelData] = useState(null);

    const fetchTimetables = async () => {
        try {
            const params = {
                role: userRole,
                subRole: userSubRole,
                year: filters.year,
                section: filters.section
            };
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-timetables`, { params });
            setTimetables(response.data.timetables);
        } catch (error) {
            console.error("Error fetching timetables", error);
        }
    };

    // Fetch Faculty List for HOD
    const fetchFaculty = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-dept-faculty`, {
                params: { dept: userSubRole }
            });
            setDeptFaculty(response.data.faculty);
        } catch (error) {
            console.error("Error fetching faculty list", error);
        }
    };

    const togglePermission = async (facId, currentStatus) => {
        console.log(`[Frontend] Toggling permission for ${facId}, Current Status: ${currentStatus}`);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-timetable-permission`, {
                id: facId,
                canUpload: !currentStatus
            });
            fetchFaculty();
        } catch (error) {
            alert("Failed to update permission");
        }
    };

    useEffect(() => {
        if (userRole !== 'Student' || (filters.year && filters.section)) {
            fetchTimetables();
        } else {
            setTimetables([]);
        }

        if (userRole === 'HOD' && showPermissions) {
            fetchFaculty();
        }
    }, [userRole, filters, userSubRole, showPermissions]);

    const handleUpload = async (e) => {
        e.preventDefault();

        const confirmMsg = `WARNING: Uploading this will REPLACE any existing timetable for Year ${uploadForm.targetYear}, Section ${uploadForm.targetSection}. Continue?`;
        if (!window.confirm(confirmMsg)) return;

        const formData = new FormData();
        formData.append('targetYear', uploadForm.targetYear);
        formData.append('targetSection', uploadForm.targetSection);
        formData.append('file', uploadForm.file);
        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            id: userId,
            role: userRole,
            subRole: userSubRole
        }));

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-timetable`, formData);
            alert('Timetable Uploaded/Updated Successfully!');
            setIsUploading(false);
            setUploadForm({ targetYear: '', targetSection: '', file: null });
            fetchTimetables();
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Error uploading timetable';
            alert(errMsg);
            console.error(error);
        }
    };

    // --- EXCEL RENDERING ---
    const handleViewClick = async (fileId, event) => {
        event.preventDefault();
        if (!fileId || !fileId.filePath) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/proxy-file/${fileId.filePath}`, {
                responseType: 'arraybuffer'
            });
            const data = new Uint8Array(response.data);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            setExcelData(html);
            setViewingFile(true);
        } catch (error) {
            console.error("Error parsing Excel file", error);
            alert("Could not render the Excel file.");
        }
    };

    const closeViewer = () => {
        setViewingFile(false);
        setExcelData(null);
    };

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic
    const authorizedFaculty = deptFaculty.filter(f => f.canUploadTimetable);
    const availableFaculty = deptFaculty.filter(f =>
        !f.canUploadTimetable &&
        (f.username.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.includes(searchQuery))
    );

    // --- PINNING LOGIC (Students Only) ---
    const [pinnedTimetables, setPinnedTimetables] = useState([]);

    const fetchPinnedTimetables = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-pinned-timetables`, {
                params: { userId }
            });
            setPinnedTimetables(response.data.pinned);
        } catch (error) {
            console.error("Error fetching pinned", error);
        }
    };

    const handlePin = async (e, timetableId) => {
        e.stopPropagation(); // Prevent opening the file
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/toggle-pin-timetable`, {
                userId,
                timetableId
            });
            fetchPinnedTimetables(); // Re-fetch to ensure sync
        } catch (error) {
            alert(error.response?.data?.message || "Error pinning timetable");
        }
    };

    useEffect(() => {
        if (userRole === 'Student') {
            fetchPinnedTimetables();
        }
    }, [userRole, userId]); // Added userId dependency


    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>{userRole === 'Student' ? 'My Timetable' : 'Student Related / Time Table'}</h2>

                <div className="materials-tabs">
                    {userRole === 'HOD' && (
                        <button
                            className={`std-tab-btn ${showPermissions ? 'active' : ''}`}
                            onClick={() => { setShowPermissions(!showPermissions); setIsUploading(false); }}
                        >
                            <FaUserCog /> Access Control
                        </button>
                    )}

                    {canUpload && (
                        <button
                            className={`std-tab-btn ${isUploading ? 'active' : ''}`}
                            onClick={() => { setIsUploading(!isUploading); setShowPermissions(false); }}
                        >
                            <FaCloudUploadAlt /> {isUploading ? 'View List' : 'Upload Timetable'}
                        </button>
                    )}
                </div>
            </div>

            {/* HOD: PERMISSION MANAGER (Code remains same) */}
            {showPermissions && userRole === 'HOD' && (
                <div className="permission-manager">
                    <div className="pm-header">
                        <h3 className="pm-title">Authorized Faculty ({authorizedFaculty.length})</h3>
                        <button className="std-btn" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel Adding' : '+ Add Person'}
                        </button>
                    </div>

                    {!showAddForm && (
                        <div className="faculty-list">
                            {authorizedFaculty.length > 0 ? authorizedFaculty.map(fac => (
                                <div key={fac._id} className="target-chip chip-user-fac">
                                    <FaUser /> <span>{fac.username}</span>
                                    <span style={{ fontSize: '12px', color: '#684073', marginLeft: '5px' }}>({fac.id})</span>
                                    <FaTimes className="chip-remove" style={{ marginLeft: '10px' }} onClick={() => togglePermission(fac.id, true)} title="Revoke Access" />
                                </div>
                            )) : <p className="empty-msg">No faculty members currently have upload access.</p>}
                        </div>
                    )}

                    {showAddForm && (
                        <div className="user-picker-box">
                            <div className="targets-label">Search {userSubRole} Faculty</div>
                            <div className="picker-filters-row">
                                <input type="text" className="picker-input" placeholder="Search Name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                            </div>
                            <div className="user-results-list">
                                {availableFaculty.length > 0 ? availableFaculty.map(fac => (
                                    <div key={fac._id} className="user-result-item" onClick={() => { togglePermission(fac.id, false); setSearchQuery(''); }}>
                                        <span><b>{fac.username}</b> ({fac.id})</span>
                                        <span style={{ color: '#059669', fontSize: '12px', fontWeight: 'bold' }}>+ Grant Access</span>
                                    </div>
                                )) : <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{searchQuery ? "No matching faculty found." : "Type to search faculty..."}</div>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* UPLOAD FORM */}
            {isUploading && (
                <div className="upload-section">
                    <form onSubmit={handleUpload} className="std-form">
                        <h3 className="section-title">Upload Class Timetable (Excel)</h3>
                        <p className="warning-text">Note: Uploading will replace any existing timetable for this Year & Section.</p>
                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Target Year</label>
                                <input className="std-input" type="number" required value={uploadForm.targetYear} onChange={e => setUploadForm({ ...uploadForm, targetYear: e.target.value })} />
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Target Section</label>
                                <input className="std-input" type="number" required value={uploadForm.targetSection} onChange={e => setUploadForm({ ...uploadForm, targetSection: e.target.value })} />
                            </div>
                        </div>
                        <div className="std-form-group">
                            <label className="std-label">Excel File (.xlsx, .xls)</label>
                            <input className="std-file-input" type="file" accept=".xlsx, .xls" required onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                        </div>
                        <div className="std-form-footer">
                            <button type="submit" className="std-btn">Upload & Replace</button>
                        </div>
                    </form>
                </div>
            )}



            {/* UNIFIED FILTERS (Dropdowns for All Roles) */}
            <div className="timetable-filter-bar" style={{ marginBottom: '20px' }}>
                <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                    {userRole === 'Student' ? "Select your Year and Section:" : "Filter Timetables:"}
                </p>
                <div className="filter-inputs" style={{ display: 'flex', gap: '15px' }}>
                    <select
                        className="std-input"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        style={{ maxWidth: '150px' }}
                    >
                        <option value="">All Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>
                    <select
                        className="std-input"
                        value={filters.section}
                        onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        style={{ maxWidth: '150px' }}
                    >
                        <option value="">All Sections</option>
                        <option value="1">Section 1</option>
                        <option value="2">Section 2</option>
                        <option value="3">Section 3</option>
                        <option value="4">Section 4</option>
                    </select>
                </div>
            </div>


            {/* STUDENT: PINNED TIMETABLES */}
            {
                userRole === 'Student' && pinnedTimetables.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 className="section-title" style={{ fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaThumbtack style={{ transform: 'rotate(45deg)', color: '#F97316' }} /> Pinned Timetables
                        </h3>
                        <div className="items-grid">
                            {pinnedTimetables.map((item) => (
                                <div key={item._id} className="timetable-card pinned" onClick={(e) => handleViewClick(item.fileId, e)} style={{ borderColor: '#F97316', backgroundColor: '#fff7ed' }}>
                                    <button
                                        className="pin-btn active"
                                        onClick={(e) => handlePin(e, item._id)}
                                        title="Unpin Timetable"
                                    >
                                        <FaThumbtack />
                                    </button>
                                    <div className="tt-icon-box" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                                        <FaTable />
                                    </div>
                                    <div className="tt-info">
                                        <span className="tt-title">Year {item.targetYear} - Section {item.targetSection}</span>
                                        <span className="tt-meta">
                                            <FaCalendarAlt /> Updated: {new Date(item.uploadedAt).toLocaleDateString('en-GB')}
                                        </span>
                                        <span className="uploader-info" style={{ fontSize: '11px', color: '#4b5563', fontWeight: 'bold' }}>
                                            By: {item.uploadedBy?.username}
                                        </span>
                                        <span className="click-hint">Click to View Schedule</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* LIST OF TIMETABLES */}
            <div className="items-grid">
                {timetables.length > 0 ? (
                    timetables.map((item) => (
                        <div key={item._id} className="timetable-card" onClick={(e) => handleViewClick(item.fileId, e)}>
                            {userRole === 'Student' && (
                                <button
                                    className={`pin-btn ${pinnedTimetables.some(p => String(p._id) === String(item._id)) ? 'active' : ''}`}
                                    onClick={(e) => handlePin(e, item._id)}
                                    title={pinnedTimetables.some(p => String(p._id) === String(item._id)) ? "Unpin Timetable" : "Pin Timetable"}
                                >
                                    <FaThumbtack />
                                </button>
                            )}
                            <div className="tt-icon-box">
                                <FaTable />
                            </div>
                            <div className="tt-info">
                                <span className="tt-title">Year {item.targetYear} - Section {item.targetSection}</span>
                                <span className="tt-meta">
                                    <FaCalendarAlt /> Updated: {new Date(item.uploadedAt).toLocaleDateString('en-GB')}
                                </span>
                                <span className="uploader-info" style={{ fontSize: '11px', color: '#4b5563', fontWeight: 'bold' }}>
                                    By: {item.uploadedBy?.username}
                                </span>
                                <span className="click-hint">Click to View Schedule</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        {userRole === 'Student' && !filters.year ? "" : "No timetables found."}
                    </div>
                )}
            </div>

            {/* EXCEL VIEWER */}
            {
                viewingFile && (
                    <div className="std-modal-overlay">
                        <div className="std-modal" style={{ width: '80%', maxWidth: '900px', height: '80vh' }}>
                            <div className="std-modal-header">
                                <h3 className="std-modal-title">Timetable View</h3>
                                <button className="std-close-btn" onClick={closeViewer}><FaTimes /></button>
                            </div>
                            <div className="std-modal-body">
                                <div className="excel-content" dangerouslySetInnerHTML={{ __html: excelData }} />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TimetableManager;
