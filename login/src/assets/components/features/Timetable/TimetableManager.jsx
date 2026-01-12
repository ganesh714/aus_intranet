import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Requires: npm install xlsx
import { FaTable, FaCloudUploadAlt, FaCalendarAlt, FaTimes, FaUserCog, FaCheck, FaBan, FaUser } from 'react-icons/fa';
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
            const response = await axios.get('http://localhost:5001/get-timetables', { params });
            setTimetables(response.data.timetables);
        } catch (error) {
            console.error("Error fetching timetables", error);
        }
    };

    // Fetch Faculty List for HOD
    const fetchFaculty = async () => {
        try {
            const response = await axios.get('http://localhost:5001/get-dept-faculty', {
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
            await axios.post('http://localhost:5001/toggle-timetable-permission', {
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
            await axios.post('http://localhost:5001/add-timetable', formData);
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
            const response = await axios.get(`http://localhost:5001/proxy-file/${fileId.filePath}`, {
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

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>{userRole === 'Student' ? 'My Timetable' : 'Student Related / Time Table'}</h2>

                <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                    {userRole === 'HOD' && (
                        <button className="std-btn std-btn-secondary" style={{ backgroundColor: '#4b5563', color: 'white' }} onClick={() => { setShowPermissions(!showPermissions); setIsUploading(false); }}>
                            <FaUserCog /> Access Control
                        </button>
                    )}

                    {canUpload && (
                        <button className="std-btn" onClick={() => { setIsUploading(!isUploading); setShowPermissions(false); }}>
                            <FaCloudUploadAlt /> {isUploading ? 'View List' : 'Upload Timetable'}
                        </button>
                    )}
                </div>
            </div>

            {/* HOD: PERMISSION MANAGER */}
            {showPermissions && userRole === 'HOD' && (
                <div className="permission-manager" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#1E3A8A', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Manage Faculty Upload Access</h3>
                    <div className="faculty-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                        {deptFaculty.map(fac => (
                            <div key={fac._id} className="faculty-perm-item" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px', background: '#f9fafb' }}>
                                <span className="fac-name" style={{ fontWeight: 'bold', color: '#333' }}><FaUser /> {fac.username}</span>
                                <span className="fac-email" style={{ fontSize: '12px', color: '#666' }}>ID: {fac.id}</span>
                                <button
                                    className={`toggle-perm-btn`}
                                    style={{
                                        marginTop: '10px', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                        background: fac.canUploadTimetable ? '#dcfce7' : '#fee2e2',
                                        color: fac.canUploadTimetable ? '#166534' : '#991b1b',
                                        fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                    }}
                                    onClick={() => togglePermission(fac.id, !!fac.canUploadTimetable)}
                                >
                                    {fac.canUploadTimetable ? <><FaCheck /> Access Granted</> : <><FaBan /> Access Denied</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* UPLOAD FORM */}
            {isUploading && (
                <div className="announce-container" style={{ marginBottom: '20px' }}>
                    <form onSubmit={handleUpload} className="announce-form">
                        <h3>Upload Class Timetable (Excel)</h3>
                        <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>Note: Uploading will replace any existing timetable for this Year & Section.</p>
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

            {/* STUDENT FILTERS */}
            {userRole === 'Student' && (
                <div className="timetable-filter-bar">
                    <p style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>Enter your Year and Section to find your schedule:</p>
                    <div className="filter-inputs">
                        <input type="number" className="std-input" placeholder="Year (e.g. 2)" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
                        <input type="number" className="std-input" placeholder="Section (e.g. 1)" value={filters.section} onChange={(e) => setFilters({ ...filters, section: e.target.value })} />
                    </div>
                </div>
            )}

            {/* LIST OF TIMETABLES */}
            <div className="items-grid">
                {timetables.length > 0 ? (
                    timetables.map((item) => (
                        <div key={item._id} className="doc-card timetable-card" onClick={(e) => handleViewClick(item.fileId, e)}>
                            <div className="doc-icon-box" style={{ background: '#ecfccb', color: '#65a30d' }}>
                                <FaTable />
                            </div>
                            <div className="doc-info">
                                <span className="doc-title">Year {item.targetYear} - Section {item.targetSection}</span>
                                <span style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
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
            {viewingFile && (
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
            )}
        </div>
    );
};

export default TimetableManager;
