import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import './Syllabus.css';

const SyllabusManager = ({ userId, userRole, userSubRole, onFileClick }) => {
    const [syllabusList, setSyllabusList] = useState([]);
    const [subRolesList, setSubRolesList] = useState([]);

    // Upload Permission State
    const [canUpload, setCanUpload] = useState(false);

    // Tab State: 'view' or 'upload'
    const [activeTab, setActiveTab] = useState('view');

    // Filters
    const [filters, setFilters] = useState({
        academicYear: '',
        branch: 'All'
    });

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        academicYear: '',
        branch: '',
        title: '',
        file: null
    });

    // 1. Fetch SubRoles & Check Permissions on Mount
    useEffect(() => {
        const fetchAccessLimits = async () => {
            try {
                // Fetch SubRoles for Dropdowns
                const srRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/subroles/HOD`);
                const allSubRoles = srRes.data.subRoles || [];
                setSubRolesList(allSubRoles);

                // Check Special Feature from SubRole natively
                let hasSubRolePermission = false;
                if (userSubRole) {
                    const mySubRole = allSubRoles.find(sr => sr.code === userSubRole || sr.displayName === userSubRole || sr.name === userSubRole);
                    if (mySubRole && mySubRole.specialFeatures && mySubRole.specialFeatures.includes('UPLOAD_SYLLABUS')) {
                        hasSubRolePermission = true;
                    }
                }

                // Fallback check: Fetch personal granular permissions
                let hasPersonalPermission = false;
                const userRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-users`, { params: { id: userId } });
                const myUser = userRes.data.users?.find(u => u.id === userId);
                if (myUser && myUser.permissions && myUser.permissions.canUploadSyllabus) {
                    hasPersonalPermission = true;
                }

                setCanUpload(hasSubRolePermission || hasPersonalPermission);

            } catch (error) {
                console.error("Error fetching access data for syllabus:", error);
            }
        };

        fetchAccessLimits();
        fetchSyllabus();
    }, [userId, userRole, userSubRole]);

    // 2. Fetch Syllabus
    const fetchSyllabus = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-syllabus`);
            setSyllabusList(res.data.syllabusList || []);
        } catch (error) {
            console.error("Error fetching syllabus:", error);
        }
    };

    // 3. Handle File Upload
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadData.file) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('academicYear', uploadData.academicYear);
        formData.append('branch', uploadData.branch);
        formData.append('title', uploadData.title);
        formData.append('file', uploadData.file);
        formData.append('uploadedBy', userId);

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-syllabus`, formData);
            alert("Syllabus Uploaded Successfully!");
            setUploadData({ academicYear: '', branch: '', title: '', file: null });
            setActiveTab('view');
            fetchSyllabus();
        } catch (error) {
            console.error(error);
            alert("Error uploading syllabus");
        }
    };

    // 4. Handle Delete
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this syllabus? It cannot be undone.")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-syllabus/${id}`);
            fetchSyllabus();
        } catch (error) {
            console.error("Error deleting syllabus", error);
            alert("Failed to delete.");
        }
    };

    // Derived Display List
    const displayedSyllabus = syllabusList.filter(item => {
        if (filters.academicYear && item.academicYear !== filters.academicYear) return false;
        if (filters.branch !== 'All' && item.branch !== filters.branch) return false;
        return true;
    });

    // Helper to generate Years
    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => {
            const start = currentYear - i;
            return `${start}-${start + 1}`;
        });
    };

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>Academic Syllabus</h2>

                {canUpload && (
                    <div className="materials-tabs">
                        <button
                            className={`std-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                            onClick={() => setActiveTab('view')}
                        >
                            View Syllabus
                        </button>
                        <button
                            className={`std-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            <FaCloudUploadAlt /> Upload New
                        </button>
                    </div>
                )}
            </div>

            {/* --- UPLOAD TAB --- */}
            {activeTab === 'upload' && canUpload && (
                <div className="upload-section">
                    <form onSubmit={handleUploadSubmit} className="std-form">
                        <h3 className="section-title">Upload New Syllabus</h3>

                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Academic Year</label>
                                <select
                                    className="std-input"
                                    required
                                    value={uploadData.academicYear}
                                    onChange={e => setUploadData({ ...uploadData, academicYear: e.target.value })}
                                >
                                    <option value="">Select Year</option>
                                    {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="std-form-group half">
                                <label className="std-label">Branch / Department</label>
                                <select
                                    className="std-input"
                                    required
                                    value={uploadData.branch}
                                    onChange={e => setUploadData({ ...uploadData, branch: e.target.value })}
                                >
                                    <option value="">Select Branch</option>
                                    {subRolesList.map(sr => (
                                        <option key={sr._id} value={sr.name}>{sr.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Syllabus Title</label>
                            <input
                                type="text"
                                className="std-input"
                                required
                                placeholder="e.g. B.Tech CSE R20 Syllabus"
                                value={uploadData.title}
                                onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">PDF Document</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="std-file-input"
                                required
                                onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                            />
                        </div>

                        <div className="std-form-footer">
                            <button type="submit" className="std-btn">Submit Syllabus</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- VIEW TAB --- */}
            {activeTab === 'view' && (
                <>
                    <div className="syllabus-filters">
                        <select
                            value={filters.academicYear}
                            onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
                            className="syllabus-filter-select"
                        >
                            <option value="">All Academic Years</option>
                            {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            value={filters.branch}
                            onChange={e => setFilters({ ...filters, branch: e.target.value })}
                            className="syllabus-filter-select"
                        >
                            <option value="All">All Branches</option>
                            {subRolesList.map(sr => (
                                <option key={sr._id} value={sr.name}>{sr.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="materials-grid">
                        {displayedSyllabus.length > 0 ? (
                            displayedSyllabus.map(item => (
                                <div
                                    key={item._id}
                                    className="mat-card syllabus-card"
                                    onClick={() => onFileClick(`proxy-syllabus/${item.fileUrl}`, 'application/pdf', item.fileName)}
                                >
                                    <div className="mat-icon-wrapper">
                                        <FaBook />
                                    </div>
                                    <div className="mat-title">{item.title}</div>
                                    <div className="mat-subject">{item.academicYear} • {item.branch}</div>

                                    {canUpload && (
                                        <div className="mat-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>By: {item.uploadedBy}</span>
                                            <button
                                                onClick={(e) => handleDelete(item._id, e)}
                                                className="syllabus-delete-btn"
                                                title="Delete Syllabus"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-data-msg">No syllabus documents found for selected filters.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SyllabusManager;
