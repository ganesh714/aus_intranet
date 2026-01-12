import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaUserTie, FaUsers, FaTrash, FaUserGraduate, FaSearch } from 'react-icons/fa';
import './Materials.css';

const MaterialManager = ({ userRole, userSubRole, userId, onPdfClick }) => {
    // --- STATE ---
    const [materials, setMaterials] = useState([]);

    // Filter Logic for Viewing
    const [viewFilters, setViewFilters] = useState({
        batch: getDefaultBatch(),
    });

    // --- TAB STATE ---
    const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'upload'

    // Update fetch when tab changes
    useEffect(() => {
        if (activeTab !== 'upload') {
            fetchMaterials();
        }
    }, [activeTab]);

    // Derived lists based on Active Tab
    const displayedMaterials = materials.filter(item => {
        if (activeTab === 'sent') {
            return item.uploadedBy?.id === userId;
        } else if (activeTab === 'received') {
            return item.uploadedBy?.id !== userId;
        }
        return true;
    });

    // --- UPLOAD STATE ---
    const [uploadData, setUploadData] = useState({
        targetAudience: [],      // Array of rules: { role, subRole, batch }
        targetIndividualIds: [], // Array of User IDs (strings)
        activeInputMode: 'Group', // Added for toggle
        selectedUsers: [],       // Array of User Objects (for UI display)
        title: '',
        subject: '',
        file: null
    });

    // -- Rule Builder State --
    const [currentRule, setCurrentRule] = useState({
        role: 'Student',
        subRole: 'All', // 'All' means apply to all departments
        batch: ''
    });

    const commonDepartments = ["IT", "CSE", "AIML", "CE", "MECH", "EEE", "ECE", "Ag.E", "MPE", "FED"];

    // Helper for default batch
    function getDefaultBatch() {
        if (userRole !== 'Student') return '';
        const rawBatch = sessionStorage.getItem('userBatch') || '';
        if (/^\d{4}$/.test(rawBatch)) {
            const endYear = parseInt(rawBatch);
            return `${endYear - 4}-${endYear}`;
        }
        return rawBatch;
    }

    // --- DATA FETCHING ---
    const fetchMaterials = async () => {
        try {
            const params = {
                role: userRole,
                subRole: userSubRole,
                batch: viewFilters.batch,
                id: userId // Pass My ID for specific targeting check
            };
            const response = await axios.get('http://localhost:5001/get-materials', { params });
            setMaterials(response.data.materials);
        } catch (error) {
            console.error("Error fetching materials", error);
        }
    };

    useEffect(() => {
        // Only fetch if Student has batch (or logic requires it), else fetch
        if (userRole !== 'Student' || viewFilters.batch) {
            fetchMaterials();
        } else {
            setMaterials([]);
        }
    }, [userRole, viewFilters, userSubRole]);

    // --- HANDLERS ---
    const addRule = () => {
        const newRule = {
            role: currentRule.role,
            subRole: currentRule.subRole === 'All' ? undefined : currentRule.subRole,
            batch: (currentRule.role === 'Student' && currentRule.batch) ? currentRule.batch : undefined
        };

        const isDuplicate = uploadData.targetAudience.some(r =>
            r.role === newRule.role &&
            r.subRole === newRule.subRole &&
            r.batch === newRule.batch
        );

        if (isDuplicate) {
            alert("This rule is already added.");
            return;
        }

        setUploadData({
            ...uploadData,
            targetAudience: [...uploadData.targetAudience, newRule]
        });
    };

    const removeRule = (index) => {
        const newAudience = [...uploadData.targetAudience];
        newAudience.splice(index, 1);
        setUploadData({ ...uploadData, targetAudience: newAudience });
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (uploadData.targetAudience.length === 0 && uploadData.targetIndividualIds.length === 0) {
            alert('Please add at least one Target Rule or Select Specific Users.');
            return;
        }

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('subject', uploadData.subject);
        formData.append('file', uploadData.file);
        formData.append('targetAudience', JSON.stringify(uploadData.targetAudience));
        formData.append('targetIndividualIds', JSON.stringify(uploadData.targetIndividualIds));
        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            id: userId,
            role: userRole,
            subRole: userSubRole
        }));

        try {
            await axios.post('http://localhost:5001/add-material', formData);
            alert('Material Uploaded Successfully!');
            setActiveTab('sent');
            setUploadData({
                targetAudience: [], targetIndividualIds: [], selectedUsers: [],
                title: '', subject: '', file: null
            });
            fetchMaterials();
        } catch (error) {
            alert('Error uploading material');
            console.error(error);
        }
    };



    return (
        <div className="materials-container">
            <div className="materials-header">
                <h2>{userRole === 'Student' ? 'Class Shared Documents' : 'Shared Documents'}</h2>

                <div className="materials-tabs">
                    <button
                        className={`std-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        Sent by Me
                    </button>
                    <button
                        className={`std-tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        Sent to Me
                    </button>
                    <button
                        className={`std-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <FaCloudUploadAlt /> Upload New
                    </button>
                </div>
            </div>

            {/* --- UPLOAD FORM --- */}
            {activeTab === 'upload' && (
                <div className="upload-form-container">
                    <form onSubmit={handleUploadSubmit}>
                        <h3 className="upload-form-header">Upload New Material</h3>

                        {/* SECTION 1: TARGET RULES */}
                        <div className="form-section">
                            <label className="section-label">1. Target Audience</label>

                            <div className="input-mode-toggle">
                                <button
                                    type="button"
                                    onClick={() => setUploadData(prev => ({ ...prev, activeInputMode: 'Group' }))}
                                    className={`std-toggle-btn ${uploadData.activeInputMode === 'Group' ? 'active' : ''}`}
                                >
                                    Group Rule
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadData(prev => ({ ...prev, activeInputMode: 'Specific' }))}
                                    className={`std-toggle-btn ${uploadData.activeInputMode === 'Specific' ? 'active' : ''}`}
                                >
                                    Specific People
                                </button>
                            </div>

                            {uploadData.activeInputMode === 'Group' ? (
                                <div className="rule-builder-box">
                                    <div className="rb-group">
                                        <label>Role</label>
                                        <select
                                            className="rb-select"
                                            value={currentRule.role}
                                            onChange={e => setCurrentRule({ ...currentRule, role: e.target.value })}
                                            disabled={userRole === 'Student'}
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Faculty">Faculty</option>
                                        </select>
                                    </div>
                                    <div className="rb-group">
                                        <label>Department</label>
                                        <select
                                            className="rb-select"
                                            value={currentRule.subRole}
                                            onChange={e => setCurrentRule({ ...currentRule, subRole: e.target.value })}
                                        >
                                            <option value="All">All Departments</option>
                                            {commonDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    {currentRule.role === 'Student' && (
                                        <div className="rb-group">
                                            <label>Batch</label>
                                            <select
                                                className="rb-select"
                                                value={currentRule.batch}
                                                onChange={e => setCurrentRule({ ...currentRule, batch: e.target.value })}
                                            >
                                                <option value="">Select Batch</option>
                                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={`${year - 4}-${year}`}>{year - 4}-{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <button type="button" onClick={addRule} className="std-btn">+ Add</button>
                                </div>
                            ) : (
                                <UserPicker
                                    uploadData={uploadData}
                                    setUploadData={setUploadData}
                                    commonDepartments={commonDepartments}
                                    userRole={userRole}
                                />
                            )}

                            {(uploadData.targetAudience.length > 0 || uploadData.selectedUsers.length > 0) && (
                                <div className="targets-summary">
                                    <div className="targets-label">Added Targets:</div>
                                    <div className="targets-list">
                                        {uploadData.targetAudience.map((rule, idx) => (
                                            <div key={`rule-${idx}`} className="target-chip chip-rule">
                                                <FaUsers />
                                                <span>{rule.role} • {rule.subRole || 'All'} {rule.batch ? `• ${rule.batch}` : ''}</span>
                                                <FaTrash className="chip-remove" onClick={() => removeRule(idx)} />
                                            </div>
                                        ))}
                                        {uploadData.selectedUsers.map((u) => (
                                            <div key={`user-${u.id}`} className={`target-chip ${u.role === 'Faculty' ? 'chip-user-fac' : 'chip-user-stu'}`}>
                                                {u.role === 'Faculty' ? <FaUserTie /> : <FaUserGraduate />}
                                                <span>{u.username}</span>
                                                <FaTrash
                                                    className="chip-remove"
                                                    onClick={() => {
                                                        const newIds = uploadData.targetIndividualIds.filter(id => id !== u.id);
                                                        const newUsers = uploadData.selectedUsers.filter(user => user.id !== u.id);
                                                        setUploadData({ ...uploadData, targetIndividualIds: newIds, selectedUsers: newUsers });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 2: FILE DETAILS */}
                        <div className="form-section">
                            <label className="section-label">2. Document Details</label>
                            <div className="doc-details-row">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input type="text" className="form-input" required value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} placeholder="e.g. Unit 1 Notes" />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" className="form-input" required value={uploadData.subject} onChange={e => setUploadData({ ...uploadData, subject: e.target.value })} placeholder="e.g. Data Structures" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>File Attachment</label>
                                <input type="file" className="file-input" required onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })} />
                            </div>
                        </div>

                        <div className="submit-section">
                            <button type="submit" className="std-btn">
                                Upload Material
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- MATERIALS LIST --- */}
            {activeTab !== 'upload' && (
                <div className="materials-grid">
                    {displayedMaterials.length > 0 ? (
                        displayedMaterials.map((item) => (
                            <div
                                key={item._id}
                                className="mat-card"
                                onClick={(e) => onPdfClick(item.fileId?.filePath, e)}
                            >
                                <div className="mat-icon-wrapper">
                                    <FaBook />
                                </div>
                                <div className="mat-title">{item.title}</div>
                                <div className="mat-subject">{item.subject}</div>

                                {activeTab !== 'sent' && (
                                    <div className="mat-meta">
                                        By: {item.uploadedBy?.username}
                                    </div>
                                )}



                                {activeTab === 'sent' && (
                                    <div className="mat-badges">
                                        <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '4px' }}>To:</span>
                                        {item.targetAudience?.map((r, i) => (
                                            <span key={i} className="mat-badge">{r.role} {r.subRole && `• ${r.subRole}`}</span>
                                        ))}
                                        {item.targetIndividualIds?.length > 0 && (
                                            <span className="mat-badge" title={item.targetIndividualIds.join(', ')}>
                                                Specific Users ({item.targetIndividualIds.length})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-data-msg">
                            {userRole === 'Student' && !viewFilters.batch ? "Enter Batch to see documents." : "No documents found."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// UserPicker Subcomponent
const UserPicker = ({ uploadData, setUploadData, commonDepartments, userRole }) => {
    const [filters, setFilters] = useState({ role: 'Student', dept: 'All', batch: '', search: '' });
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (userRole === 'Student') setFilters(prev => ({ ...prev, role: 'Student' }));
    }, [userRole]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const params = {
                role: filters.role,
                dept: filters.dept,
                batch: filters.batch,
                search: filters.search
            };
            if (filters.dept === 'All' && !filters.search && !filters.batch) {
                // optional: skip generic fetch
            }
            const res = await axios.get('http://localhost:5001/get-users', { params });
            setAvailableUsers(res.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [filters]);

    const toggleUser = (user) => {
        const isSelected = uploadData.targetIndividualIds.includes(user.id);
        let newIds, newUsers;

        if (isSelected) {
            newIds = uploadData.targetIndividualIds.filter(id => id !== user.id);
            newUsers = uploadData.selectedUsers.filter(u => u.id !== user.id);
        } else {
            newIds = [...uploadData.targetIndividualIds, user.id];
            newUsers = [...uploadData.selectedUsers, user];
        }
        setUploadData({ ...uploadData, targetIndividualIds: newIds, selectedUsers: newUsers });
    };

    return (
        <div className="user-picker-box">
            <div className="targets-label">Search People</div>
            <div className="picker-filters-row">
                <select
                    className="rb-select" style={{ width: 'auto' }}
                    value={filters.role}
                    onChange={e => setFilters({ ...filters, role: e.target.value })}
                    disabled={userRole === 'Student'}
                >
                    <option value="Student">Students</option>
                    <option value="Faculty">Faculty</option>
                </select>

                <select
                    className="rb-select" style={{ width: 'auto' }}
                    value={filters.dept}
                    onChange={e => setFilters({ ...filters, dept: e.target.value })}
                >
                    <option value="All">All Depts</option>
                    {commonDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {filters.role === 'Student' && (
                    <select
                        className="rb-select" style={{ width: 'auto' }}
                        value={filters.batch}
                        onChange={e => setFilters({ ...filters, batch: e.target.value })}
                    >
                        <option value="">Batch</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={`${year - 4}-${year}`}>{year - 4}-{year}</option>
                        ))}
                    </select>
                )}

                <input
                    type="text"
                    className="picker-input"
                    placeholder="Search by ID or Name..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
            </div>

            <div className="user-results-list">
                {loadingUsers ? <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div> : availableUsers.length > 0 ? availableUsers.map(user => (
                    <div key={user._id}
                        onClick={() => toggleUser(user)}
                        className={`user-result-item ${uploadData.targetIndividualIds.includes(user.id) ? 'selected' : ''}`}
                    >
                        <span><b>{user.username}</b> ({user.id})</span>
                        <span style={{ color: '#666' }}>{user.subRole} {user.batch ? `- ${user.batch}` : ''}</span>
                    </div>
                )) : <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No users found.</div>}
            </div>

        </div>
    );
};

export default MaterialManager;
