import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaUserTie, FaUsers, FaTrash, FaUserGraduate, FaSearch } from 'react-icons/fa';
import './Materials.css';

import './Materials.css';

const ROLE_HIERARCHY = {
    'Admin': 1,
    'Officers': 1,
    'Dean': 2,
    'Asso.Dean': 3,
    'Associate Dean': 3, // Alias for logic
    'Assoc Dean': 3,     // Alias for logic
    'HOD': 4,
    'Faculty': 5,
    'Student': 6
};

const COMMON_DEPTS = ["IT", "CSE", "AIML", "CE", "MECH", "EEE", "ECE", "Ag.E", "MPE", "FED"];

const ROLE_SUBROLES = {
    'Officers': ['DyPC', 'VC', 'ProVC', 'Registrar'],
    'Dean': ['IQAC', 'R&D', 'CLM', 'CD'],
    'Asso.Dean': ['SOE', 'IQAC', 'ADMIN'],
    'HOD': COMMON_DEPTS,
    'Faculty': COMMON_DEPTS,
    'Student': COMMON_DEPTS
};

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
        role: (ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY['Faculty']) ? 'Student' : 'Faculty', // Default intelligently
        subRole: (['HOD', 'Faculty'].includes(userRole) && userSubRole) ? userSubRole : 'All', 
        batch: ''
    });

    // Update rule subRole if userRole changes (e.g. initial load) to enforce lock
    useEffect(() => {
        if (['HOD', 'Faculty'].includes(userRole) && userSubRole) {
            setCurrentRule(prev => ({ ...prev, subRole: userSubRole }));
        }
    }, [userRole, userSubRole]);

    // const commonDepartments = ["IT", "CSE", "AIML", "CE", "MECH", "EEE", "ECE", "Ag.E", "MPE", "FED"];
    // Using global const now
    
    // Updates subRole when role changes in rule builder if needed (reset to All or first option?)
    // Actually, we should probably reset subRole to 'All' when role changes, unless it's locked.
    useEffect(() => {
        if (!(['HOD', 'Faculty'].includes(userRole) && userSubRole && currentRule.role === userRole)) {
             // If not locked, reset subRole when role changes to avoid stale values
             // But only if we are user interaction driving this. 
             // Start simple: If the new role has subroles, default to 'All'.
             if (ROLE_SUBROLES[currentRule.role]) {
                 setCurrentRule(prev => ({...prev, subRole: 'All'}));
             }
        }
    }, [currentRule.role]);

    // Updates subRole when role changes using correct Lock vs Unlock logic
    useEffect(() => {
        const isLocked = ['HOD', 'Faculty'].includes(userRole) && userRole !== currentRule.role;

        if (isLocked) {
             // STRICT LOCK: Must be user's subRole
             if (userSubRole) {
                 setCurrentRule(prev => ({ ...prev, subRole: userSubRole }));
             }
        } else {
             // UNLOCKED: Peer-Sharing or Admin/Dean
             // Reset to 'All' if the new role supports sub-roles
             if (ROLE_SUBROLES[currentRule.role]) {
                 setCurrentRule(prev => ({ ...prev, subRole: 'All' }));
             }
        }
    }, [currentRule.role, userRole, userSubRole]);

    // Helper for default batch
    function getDefaultBatch() {
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
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-materials`, { params });
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-material`, formData);
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
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>{userRole === 'Student' ? 'Class Shared Documents' : 'Shared Documents'}</h2>

                {userRole !== 'Student' && (
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
                )}
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
                                            {/* Filter Roles: Only allow roles with Level >= My Level (meaning Rank <= My Rank in numeric terms? No.) 
                                                Hierarchy: Admin(1) -> Student(6).
                                                Requirement: Send to Below or Equal.
                                                Target Level >= My Level. 
                                                e.g. Faculty(5). Target >= 5. so Faculty(5), Student(6).
                                                e.g. Dean(2). Target >= 2. so Dean(2), Asso.Dean(3), HOD(4)...
                                            */}
                                            {Object.keys(ROLE_HIERARCHY)
                                                .filter(r => !['Associate Dean', 'Assoc Dean'].includes(r)) // Filter aliases from UI
                                                .filter(r => (ROLE_HIERARCHY[r] >= (ROLE_HIERARCHY[userRole] || 99)))
                                                .map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                        </select>
                                    </div>
                                    {/* SubRole Dropdown: Show if the selected role has defined sub-roles */}
                                    {ROLE_SUBROLES[currentRule.role] && (
                                        <div className="rb-group">
                                            <label>Sub-Role / Dept</label>
                                            <select
                                                className="rb-select"
                                                value={currentRule.subRole}
                                                onChange={e => setCurrentRule({ ...currentRule, subRole: e.target.value })}
                                                disabled={
                                                    // Lock for HOD/Faculty UNLESS Peer-to-Peer
                                                    ['HOD', 'Faculty'].includes(userRole) && userRole !== currentRule.role
                                                }
                                            >
                                                <option value="All">All {currentRule.role === 'Student' ? 'Departments' : 'Sub-Roles'}</option>
                                                {ROLE_SUBROLES[currentRule.role].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    )}
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
                                    userSubRole={userSubRole} // Pass subRole for locking
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

                            <div className="std-form-group">
                                <label className="std-label">Title</label>
                                <input
                                    type="text"
                                    className="std-input"
                                    required
                                    value={uploadData.title}
                                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                    placeholder="e.g. Unit 1 Notes"
                                />
                            </div>

                            <div className="std-form-group">
                                <label className="std-label">Subject</label>
                                <input
                                    type="text"
                                    className="std-input"
                                    required
                                    value={uploadData.subject}
                                    onChange={e => setUploadData({ ...uploadData, subject: e.target.value })}
                                    placeholder="e.g. Data Structures"
                                />
                            </div>

                            <div className="std-form-group">
                                <label className="std-label">File Attachment</label>
                                <input
                                    type="file"
                                    className="std-file-input"
                                    required
                                    onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                                />
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPdfClick(item.fileId?.filePath, item.fileId?.fileType, item.title);
                                }}
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
            )
            }
        </div >
    );
};

// UserPicker Subcomponent
const UserPicker = ({ uploadData, setUploadData, commonDepartments, userRole, userSubRole }) => {
     // Default role to lowest available permission or Student
    const myLevel = ROLE_HIERARCHY[userRole] || 99;
    const defaultRole = (ROLE_HIERARCHY['Student'] >= myLevel) ? 'Student' : userRole;
    
    // Default Dept: Lock to subRole if HOD/Faculty
    // Note: If peer-to-peer, we unlock. This initial default is tricky.
    // For now, default to 'All' unless strict lock needed.
    // Strict lock logic: HOD/Faculty can only search their dept if searching for DIFFERENT role.
    // Ideally, defaultDept should match userSubRole if they are likely to search generally.
    const defaultDept = (['HOD', 'Faculty'].includes(userRole) && uploadData.userSubRole) ? uploadData.userSubRole : 'All';

    // Note: uploadData doesn't contain userSubRole directly in props usually, but we have it in parent scope.
    // Let's pass userSubRole to UserPicker explicitly in parent return.

    // Fix: We need userSubRole here.
    // Parent passes: userRole. We need userSubRole too.
    
    const [filters, setFilters] = useState({ role: defaultRole, dept: 'All', batch: '', search: '' });
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (userRole === 'Student') {
            setFilters(prev => ({ ...prev, role: 'Student' }));
        }
        // Lock dept for HOD/Faculty IF role filter is NOT same as userRole
        if (['HOD', 'Faculty'].includes(userRole) && userSubRole) {
             if (filters.role !== userRole) {
                setFilters(prev => ({ ...prev, dept: userSubRole }));
             }
        }
    }, [userRole, userSubRole, filters.role]);

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
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-users`, { params });
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
                     {Object.keys(ROLE_HIERARCHY)
                        .filter(r => !['Associate Dean', 'Assoc Dean'].includes(r)) // Filter aliases from UI
                        .filter(r => (ROLE_HIERARCHY[r] >= (ROLE_HIERARCHY[userRole] || 99)))
                        .map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                </select>

                 {/* Department/Sub-Role Filter: Show if target role has sub-roles */}
                {ROLE_SUBROLES[filters.role] && (
                    <select
                        className="rb-select" style={{ width: 'auto' }}
                        value={filters.dept}
                        onChange={e => setFilters({ ...filters, dept: e.target.value })}
                        disabled={
                             // Lock for HOD/Faculty UNLESS Peer-to-Peer
                             ['HOD', 'Faculty'].includes(userRole) && userRole !== filters.role
                        }
                    >
                        <option value="All">All</option>
                        {ROLE_SUBROLES[filters.role].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                )}

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
