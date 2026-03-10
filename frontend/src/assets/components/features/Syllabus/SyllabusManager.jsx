import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaTrash, FaChevronDown, FaGraduationCap, FaCalendarCheck } from 'react-icons/fa';
import './Syllabus.css';

const SyllabusManager = ({ userId, userRole, userSubRole, onFileClick }) => {
    const [syllabusList, setSyllabusList] = useState([]);
    const [subRolesList, setSubRolesList] = useState([]);
    const [expandedDepts, setExpandedDepts] = useState({});
    const [activeBatchTabs, setActiveBatchTabs] = useState({});

    // Upload Permission State
    const [canUpload, setCanUpload] = useState(false);

    // Tab State: 'view' or 'upload'
    const [activeTab, setActiveTab] = useState('view');

    // Filters
    const [filters, setFilters] = useState({
        batch: '',
        branch: 'All'
    });

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        batch: '',
        branch: '',
        title: '',
        file: null
    });

    // 1. Fetch SubRoles & Check Permissions on Mount
    useEffect(() => {
        const fetchAccessLimits = async () => {
            try {
                const srRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
                const allSubRoles = srRes.data.subRoles || [];

                const branchSubRoles = allSubRoles.filter(sr => sr.allowedRoles && sr.allowedRoles.includes('HOD'));
                setSubRolesList(branchSubRoles);

                let hasSubRolePermission = false;
                if (userSubRole) {
                    const mySubRole = allSubRoles.find(sr => sr._id === userSubRole || sr.code === userSubRole || sr.displayName === userSubRole || sr.name === userSubRole);
                    if (mySubRole && mySubRole.specialFeatures && mySubRole.specialFeatures.includes('UPLOAD_SYLLABUS')) {
                        hasSubRolePermission = true;
                    }
                }

                let hasPersonalPermission = false;
                const userRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-users`, { params: { id: userId } });
                const myUser = userRes.data.users?.find(u => u.id === userId);
                if (myUser && myUser.permissions && myUser.permissions.canUploadSyllabus) {
                    hasPersonalPermission = true;
                }

                setCanUpload(userRole === 'Admin' || hasSubRolePermission || hasPersonalPermission);

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

    const toggleAccordion = (dept) => {
        setExpandedDepts(prev => ({
            ...prev,
            [dept]: !prev[dept]
        }));
    };

    const setBatchTab = (dept, batch) => {
        setActiveBatchTabs(prev => ({
            ...prev,
            [dept]: batch
        }));
    };

    // 3. Handle File Upload
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadData.file) {
            alert("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append('batch', uploadData.batch);
        formData.append('branch', uploadData.branch);
        formData.append('title', uploadData.title);
        formData.append('file', uploadData.file);
        formData.append('uploadedBy', userId);

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-syllabus`, formData);
            alert("Syllabus Uploaded Successfully!");
            setUploadData({ batch: '', branch: '', title: '', file: null });
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

    // Data Grouping Logic
    const getGroupedData = () => {
        const filtered = syllabusList.filter(item => {
            if (filters.batch && item.batch !== filters.batch) return false;
            if (filters.branch !== 'All' && item.branch !== filters.branch) return false;
            return true;
        });

        const groups = {};

        filtered.forEach(item => {
            const branch = item.branch || 'General';
            if (!groups[branch]) groups[branch] = {};

            const batchYear = item.batch;
            if (!groups[branch][batchYear]) groups[branch][batchYear] = {};

            // Derive Program from title
            let program = 'B.Tech';
            if (item.title.toLowerCase().includes('m.tech')) program = 'M.Tech';
            else if (item.title.toLowerCase().includes('mba')) program = 'MBA';
            else if (item.title.toLowerCase().includes('mca')) program = 'MCA';
            else if (item.title.toLowerCase().includes('ph.d')) program = 'Ph.D';

            if (!groups[branch][batchYear][program]) groups[branch][batchYear][program] = [];
            groups[branch][batchYear][program].push(item);
        });

        return groups;
    };

    const groupedData = getGroupedData();

    // Helper to generate Batches
    const generateBatches = () => {
        return Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
    };

    const getMimeType = (fileName) => {
        if (fileName.toLowerCase().endsWith('.pdf')) return 'application/pdf';
        if (fileName.toLowerCase().endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (fileName.toLowerCase().endsWith('.doc')) return 'application/msword';
        return 'application/octet-stream';
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
                                <label className="std-label">Passing-out Batch (Year)</label>
                                <select
                                    className="std-input"
                                    required
                                    value={uploadData.batch}
                                    onChange={e => setUploadData({ ...uploadData, batch: e.target.value })}
                                >
                                    <option value="">Select Batch</option>
                                    {generateBatches().map(y => <option key={y} value={y}>{y - 4}-{y}</option>)}
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
                            <label className="std-label">Syllabus Title / Course Type</label>
                            <input
                                type="text"
                                className="std-input"
                                required
                                placeholder="e.g. Major Core Courses (MCC)"
                                value={uploadData.title}
                                onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Document (PDF or DOCX)</label>
                            <input
                                type="file"
                                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
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
                <div className="syllabus-container">
                    <div className="syllabus-filters">
                        <select
                            value={filters.batch}
                            onChange={e => setFilters({ ...filters, batch: e.target.value })}
                            className="syllabus-filter-select"
                        >
                            <option value="">All Batches</option>
                            {generateBatches().map(y => <option key={y} value={y}>{y - 4}-{y}</option>)}
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

                    <div className="syllabus-list">
                        {Object.keys(groupedData).length > 0 ? (
                            Object.keys(groupedData).sort().map(branch => {
                                const branchBatches = Object.keys(groupedData[branch]).sort();
                                const currentActiveBatch = activeBatchTabs[branch] || branchBatches[branchBatches.length - 1]; // Default to latest

                                return (
                                    <div key={branch} className={`syllabus-accordion ${expandedDepts[branch] ? 'open' : ''}`}>
                                        <div className="accordion-header" onClick={() => toggleAccordion(branch)}>
                                            <div className="header-left">
                                                <FaGraduationCap className="dept-icon" />
                                                <span>{branch}</span>
                                            </div>
                                            <FaChevronDown className="accordion-icon" />
                                        </div>
                                        <div className="accordion-content">
                                            {/* Batch Tabs Row */}
                                            <div className="batch-tabs-row">
                                                {branchBatches.map(batchYear => (
                                                    <button
                                                        key={batchYear}
                                                        className={`batch-tab-btn ${currentActiveBatch === batchYear ? 'active' : ''}`}
                                                        onClick={() => setBatchTab(branch, batchYear)}
                                                    >
                                                        <FaCalendarCheck /> {batchYear - 4}-{batchYear}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Syllabus Content for Active Batch */}
                                            <div className="batch-syllabus-pane">
                                                {currentActiveBatch && groupedData[branch][currentActiveBatch] ? (
                                                    <table className="syllabus-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Program</th>
                                                                <th>Course Syllabus</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.keys(groupedData[branch][currentActiveBatch]).map(program => (
                                                                <tr key={program}>
                                                                    <td className="program-name">{program}</td>
                                                                    <td>
                                                                        <div className="batches-column">
                                                                            {groupedData[branch][currentActiveBatch][program].map(item => (
                                                                                <div
                                                                                    key={item._id}
                                                                                    className="syllabus-item-link"
                                                                                    onClick={() => onFileClick(`proxy-syllabus/${item.fileUrl}`, getMimeType(item.fileName), item.fileName)}
                                                                                >
                                                                                    <span className="syllabus-item-title">{item.title}</span>
                                                                                    {canUpload && (
                                                                                        <button
                                                                                            onClick={(e) => handleDelete(item._id, e)}
                                                                                            className="syllabus-delete-btn"
                                                                                            title="Delete Syllabus"
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="no-batch-data">Select a batch to view syllabus.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-data-msg">No syllabus documents found matching filters.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusManager;
