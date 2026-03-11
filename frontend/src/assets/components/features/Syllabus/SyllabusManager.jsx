import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaTrash, FaChevronDown, FaGraduationCap, FaCalendarCheck } from 'react-icons/fa';
import './Syllabus.css';

const SyllabusManager = ({ userId, userRole, userSubRole, onFileClick }) => {
    const [syllabusList, setSyllabusList] = useState([]);
    const [schoolPrograms, setSchoolPrograms] = useState([]); // Fetch new config
    const [subRolesList, setSubRolesList] = useState([]);
    const [expandedDepts, setExpandedDepts] = useState({});
    const [activeBatchTabs, setActiveBatchTabs] = useState({});

    // Upload Permission State
    const [canUpload, setCanUpload] = useState(false);

    // Tab State: 'view' or 'upload'
    const [activeTab, setActiveTab] = useState('view');

    // Filters (Mandatory: school, level, program)
    const [filters, setFilters] = useState({
        school: '',
        level: '',
        program: '',
        branch: 'All', // Department
        batch: ''
    });

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        school: '',
        level: '',
        program: '',
        batch: '',
        branch: '', // Department
        title: '',
        file: null
    });

    // 1. Fetch SubRoles & Check Permissions on Mount
    useEffect(() => {
        const fetchAccessLimits = async () => {
            try {
                // Fetch SubRoles for HODs (Departments)
                const srRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
                const allSubRoles = srRes.data.subRoles || [];

                const branchSubRoles = allSubRoles.filter(sr => sr.allowedRoles && sr.allowedRoles.includes('HOD'));
                setSubRolesList(branchSubRoles);

                // Fetch School Programs Config
                const spRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-programs`);
                setSchoolPrograms(spRes.data.data || []);

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
        formData.append('school', uploadData.school);
        formData.append('level', uploadData.level);
        formData.append('program', uploadData.program);
        formData.append('batch', uploadData.batch);
        formData.append('branch', uploadData.branch);
        formData.append('title', uploadData.title);
        formData.append('file', uploadData.file);
        formData.append('uploadedBy', userId);

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-syllabus`, formData);
            alert("Syllabus Uploaded Successfully!");
            setUploadData({ school: '', level: '', program: '', batch: '', branch: '', title: '', file: null });
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

    // 5. Title Editing
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const startEditing = (item, e) => {
        e.stopPropagation();
        setEditingId(item._id);
        setEditTitle(item.title);
    };

    const cancelEditing = (e) => {
        e.stopPropagation();
        setEditingId(null);
        setEditTitle('');
    };

    const handleUpdateTitle = async (id, e) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-syllabus-title/${id}`, { title: editTitle });
            setEditingId(null);
            fetchSyllabus();
        } catch (error) {
            console.error("Error updating title:", error);
            alert("Failed to update title");
        }
    };

    // Data Grouping Logic
    const getGroupedData = () => {
        // Enforce Mandatory Filters Check FIRST
        const { school, level, program } = filters;
        if (!school || !level || !program) {
            return {}; // Return empty if mandatory filters aren't set
        }

        const filtered = syllabusList.filter(item => {
            if (item.school !== school) return false;
            if (item.level !== level) return false;
            // Handle potentially missing program in legacy data or exact match for new
            if (item.program && item.program !== program) return false; 
            
            // Optional filters
            if (filters.batch && item.batch !== filters.batch) return false;
            if (filters.branch !== 'All' && item.branch !== filters.branch) return false;
            return true;
        });

        const groups = {};

        filtered.forEach(item => {
            const branch = item.branch || 'General';
            if (!groups[branch]) groups[branch] = {};

            const batchYear = item.batch || 'Unknown Batch';
            if (!groups[branch][batchYear]) groups[branch][batchYear] = {};

            // Group by the item's program, falling back to the current active filter's program if legacy data is missing it
            const itemProgram = item.program || program;

            if (!groups[branch][batchYear][itemProgram]) groups[branch][batchYear][itemProgram] = [];
            groups[branch][batchYear][itemProgram].push(item);
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

    // Helper to get Derived Options based on Selection
    const getSchoolsOptions = () => [...new Set(schoolPrograms.map(p => p.school))];
    
    // For Upload Form
    const getUploadLevelsOptions = () => [...new Set(schoolPrograms.filter(p => p.school === uploadData.school).map(p => p.level))];
    const getUploadProgramsOptions = () => schoolPrograms.filter(p => p.school === uploadData.school && p.level === uploadData.level).map(p => p.program);
    const getUploadDeptsOptions = () => {
        const prog = schoolPrograms.find(p => p.school === uploadData.school && p.level === uploadData.level && p.program === uploadData.program);
        return prog ? prog.departments.map(d => d.name) : [];
    };

    // For Filter View
    const getFilterLevelsOptions = () => [...new Set(schoolPrograms.filter(p => p.school === filters.school).map(p => p.level))];
    const getFilterProgramsOptions = () => schoolPrograms.filter(p => p.school === filters.school && p.level === filters.level).map(p => p.program);
    const getFilterDeptsOptions = () => {
        const prog = schoolPrograms.find(p => p.school === filters.school && p.level === filters.level && p.program === filters.program);
        return prog ? prog.departments.map(d => d.name) : [];
    };

    const uploadDuration = schoolPrograms.find(p => p.school === uploadData.school && p.level === uploadData.level && p.program === uploadData.program)?.duration || 4;
    const filterDuration = schoolPrograms.find(p => p.school === filters.school && p.level === filters.level && p.program === filters.program)?.duration || 4;

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
                                <label className="std-label">School</label>
                                <select className="std-input" required value={uploadData.school} onChange={e => setUploadData({ ...uploadData, school: e.target.value, level: '', program: '', branch: '' })}>
                                    <option value="">Select School</option>
                                    {getSchoolsOptions().map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Level</label>
                                <select className="std-input" required disabled={!uploadData.school} value={uploadData.level} onChange={e => setUploadData({ ...uploadData, level: e.target.value, program: '', branch: '' })}>
                                    <option value="">Select Level</option>
                                    {getUploadLevelsOptions().map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Program</label>
                                <select className="std-input" required disabled={!uploadData.level} value={uploadData.program} onChange={e => setUploadData({ ...uploadData, program: e.target.value, branch: '' })}>
                                    <option value="">Select Program</option>
                                    {getUploadProgramsOptions().map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Department / Branch</label>
                                <select className="std-input" required disabled={!uploadData.program} value={uploadData.branch} onChange={e => setUploadData({ ...uploadData, branch: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {/* Default options from config */}
                                    {getUploadDeptsOptions().map(d => <option key={d} value={d}>{d}</option>)}
                                    {/* Fallback to subroles if config is meant to automatically map but hasn't updated immediately, or to allow any HOD-level department */}
                                    {getUploadDeptsOptions().length === 0 && subRolesList.map(sr => (
                                        <option key={sr._id} value={sr.name}>{sr.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                             <div className="std-form-group half">
                                <label className="std-label">Passing-out Batch (Year)</label>
                                <select className="std-input" required value={uploadData.batch} onChange={e => setUploadData({ ...uploadData, batch: e.target.value })}>
                                    <option value="">Select Batch</option>
                                    {generateBatches().map(y => <option key={y} value={y}>{y - uploadDuration}-{y}</option>)}
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
                    <div className="syllabus-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                         <select className="syllabus-filter-select" value={filters.school} onChange={e => setFilters({ ...filters, school: e.target.value, level: '', program: '', branch: 'All' })}>
                            <option value="">Select School (Required)</option>
                            {getSchoolsOptions().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="syllabus-filter-select" disabled={!filters.school} value={filters.level} onChange={e => setFilters({ ...filters, level: e.target.value, program: '', branch: 'All' })}>
                            <option value="">Select Level (Required)</option>
                            {getFilterLevelsOptions().map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select className="syllabus-filter-select" disabled={!filters.level} value={filters.program} onChange={e => setFilters({ ...filters, program: e.target.value, branch: 'All' })}>
                            <option value="">Select Program (Required)</option>
                            {getFilterProgramsOptions().map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        
                        {/* Optional Filters */}
                        <select className="syllabus-filter-select" disabled={!filters.program} value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })}>
                            <option value="All">All Departments</option>
                            {getFilterDeptsOptions().map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="syllabus-filter-select" value={filters.batch} onChange={e => setFilters({ ...filters, batch: e.target.value })}>
                            <option value="">All Batches</option>
                            {generateBatches().map(y => <option key={y} value={y}>{y - filterDuration}-{y}</option>)}
                        </select>
                    </div>

                    {(!filters.school || !filters.level || !filters.program) ? (
                        <div className="no-data-msg" style={{ padding: '40px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                            <FaBook style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '10px' }} />
                            <p style={{ color: '#475569', fontSize: '16px', margin: 0 }}>Please select a School, Level, and Program to view syllabus.</p>
                        </div>
                    ) : (
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
                                                        <FaCalendarCheck /> {batchYear - filterDuration}-{batchYear}
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
                                                                <th>{currentActiveBatch ? `${currentActiveBatch - filterDuration}-${currentActiveBatch}` : 'Syllabus'}</th>
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
                                                                                    className={`syllabus-item-link ${editingId === item._id ? 'editing' : ''}`}
                                                                                    onClick={() => editingId !== item._id && onFileClick(`proxy-syllabus/${item.fileUrl}`, getMimeType(item.fileName), item.fileName)}
                                                                                >
                                                                                    {editingId === item._id ? (
                                                                                        <div className="title-edit-container">
                                                                                            <input
                                                                                                className="title-edit-input"
                                                                                                value={editTitle}
                                                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                                autoFocus
                                                                                            />
                                                                                            <div className="edit-actions">
                                                                                                <button className="confirm-btn" onClick={(e) => handleUpdateTitle(item._id, e)}>Save</button>
                                                                                                <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            <span className="syllabus-item-title">{item.title}</span>
                                                                                            <div className="item-action-group">
                                                                                                {canUpload && (
                                                                                                    <>
                                                                                                        <button
                                                                                                            onClick={(e) => startEditing(item, e)}
                                                                                                            className="syllabus-edit-btn"
                                                                                                            title="Edit Title"
                                                                                                        >
                                                                                                            <FaBook />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={(e) => handleDelete(item._id, e)}
                                                                                                            className="syllabus-delete-btn"
                                                                                                            title="Delete Syllabus"
                                                                                                        >
                                                                                                            <FaTrash />
                                                                                                        </button>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </>
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
                )}
                </div>
            )}
        </div>
    );
};

export default SyllabusManager;
