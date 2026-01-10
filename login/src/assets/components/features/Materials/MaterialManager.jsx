import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaUserTie, FaUsers, FaTrash, FaUserGraduate } from 'react-icons/fa';
import '../Documents/Documents.css';

const MaterialManager = ({ userRole, userSubRole, userId, onPdfClick }) => {
    // --- STATE ---
    const [materials, setMaterials] = useState([]);
    // const [isUploading, setIsUploading] = useState(false); // Replaced by activeTab

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

    // --- UPLOAD STATE (Rule Based) ---
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
        // Validation
        const newRule = {
            role: currentRule.role,
            subRole: currentRule.subRole === 'All' ? undefined : currentRule.subRole,
            batch: (currentRule.role === 'Student' && currentRule.batch) ? currentRule.batch : undefined
        };

        // Check for duplicates (simple check)
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

        // Serialize complex data
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

            setActiveTab('sent'); // Go to sent to see new upload
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

    // --- COMPONENTS ---
    // (UserPicker extracted below)

    // --- COMPONENTS ---
    // (UserPicker extracted below)

    return (
        <div className="results-container">
            <div className="search-header">
                <h2>{userRole === 'Student' ? 'Class Shared Documents' : 'Shared Documents'}</h2>

                <div className="tabs-header" style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '15px' }}>
                    <button
                        onClick={() => setActiveTab('sent')}
                        style={{
                            padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: activeTab === 'sent' ? '#0284c7' : '#e2e8f0',
                            color: activeTab === 'sent' ? 'white' : '#64748b'
                        }}
                    >
                        Sent by Me
                    </button>
                    <button
                        onClick={() => setActiveTab('received')}
                        style={{
                            padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: activeTab === 'received' ? '#0284c7' : '#e2e8f0',
                            color: activeTab === 'received' ? 'white' : '#64748b'
                        }}
                    >
                        Sent to Me
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        style={{
                            padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: activeTab === 'upload' ? '#0284c7' : '#e2e8f0',
                            color: activeTab === 'upload' ? 'white' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <FaCloudUploadAlt /> Upload / Send Docs
                    </button>
                </div>
            </div>

            {/* --- UPLOAD FORM --- */}
            {activeTab === 'upload' && (
                <div className="announce-container" style={{ marginBottom: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '20px' }}>
                    <form onSubmit={handleUploadSubmit}>
                        {/* ... Existing FORM Content ... */}
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Upload New Material</h3>

                        {/* SECTION 1: TARGET RULES */}
                        <div className="form-section" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#334155' }}>1. Target Audience</label>

                            {/* Input Method Toggle */}
                            <div className="input-method-toggle" style={{ display: 'flex', gap: '1px', background: '#e5e7eb', padding: '2px', borderRadius: '6px', width: 'fit-content', marginBottom: '15px' }}>
                                <button
                                    type="button"
                                    onClick={() => setUploadData(prev => ({ ...prev, activeInputMode: 'Group' }))}
                                    style={{
                                        padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                        background: uploadData.activeInputMode !== 'Specific' ? 'white' : 'transparent',
                                        color: uploadData.activeInputMode !== 'Specific' ? '#0284c7' : '#64748b',
                                        boxShadow: uploadData.activeInputMode !== 'Specific' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Add Group Rule
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadData(prev => ({ ...prev, activeInputMode: 'Specific' }))}
                                    style={{
                                        padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px',
                                        background: uploadData.activeInputMode === 'Specific' ? 'white' : 'transparent',
                                        color: uploadData.activeInputMode === 'Specific' ? '#0284c7' : '#64748b',
                                        boxShadow: uploadData.activeInputMode === 'Specific' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Add Specific People
                                </button>
                            </div>

                            {/* Rule Builder Controls */}
                            {uploadData.activeInputMode !== 'Specific' ? (
                                <div className="rule-builder" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Role</label>
                                        <select
                                            value={currentRule.role}
                                            onChange={e => setCurrentRule({ ...currentRule, role: e.target.value })}
                                            disabled={userRole === 'Student'} // STUDENTS CAN ONLY TARGET STUDENTS
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px', background: userRole === 'Student' ? '#e2e8f0' : 'white' }}
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Faculty">Faculty</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Department</label>
                                        <select
                                            value={currentRule.subRole}
                                            onChange={e => setCurrentRule({ ...currentRule, subRole: e.target.value })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px' }}
                                        >
                                            <option value="All">All Departments</option>
                                            {commonDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    {currentRule.role === 'Student' && (
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Batch (Optional)</label>
                                            <select
                                                value={currentRule.batch}
                                                onChange={e => setCurrentRule({ ...currentRule, batch: e.target.value })}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px' }}
                                            >
                                                <option value="">Select Batch</option>
                                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={`${year - 4}-${year}`}>{year - 4}-{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div style={{ alignSelf: 'flex-end' }}>
                                        <button type="button" onClick={addRule} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '9px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            + Add Rule
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Specific Users */
                                <UserPicker
                                    uploadData={uploadData}
                                    setUploadData={setUploadData}
                                    commonDepartments={commonDepartments}
                                    userRole={userRole}
                                />
                            )}

                            {/* Display ALL Selected Targets (Rules + Users) */}
                            {(uploadData.targetAudience.length > 0 || uploadData.selectedUsers.length > 0) && (
                                <div className="selected-targets-summary" style={{ marginTop: '20px', padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}>Added Targets:</h4>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {/* Rules */}
                                        {uploadData.targetAudience.map((rule, idx) => (
                                            <div key={`rule-${idx}`} style={{ background: '#f0f9ff', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontSize: '13px', border: '1px solid #bae6fd' }}>
                                                <FaUsers style={{ marginRight: '6px', fontSize: '11px' }} />
                                                <span style={{ fontWeight: 'bold' }}>{rule.role}</span>
                                                <span style={{ margin: '0 5px' }}>•</span>
                                                <span>{rule.subRole || 'All Depts'}</span>
                                                {rule.batch && (
                                                    <>
                                                        <span style={{ margin: '0 5px' }}>•</span>
                                                        <span>{rule.batch}</span>
                                                    </>
                                                )}
                                                <FaTrash onClick={() => removeRule(idx)} style={{ marginLeft: '8px', cursor: 'pointer', color: '#94a3b8' }} size={11} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = '#94a3b8'} />
                                            </div>
                                        ))}

                                        {/* Users */}
                                        {uploadData.selectedUsers.map((u) => {
                                            const isFaculty = u.role === 'Faculty';
                                            return (
                                                <div key={`user-${u.id}`} style={{
                                                    background: isFaculty ? '#fdf4ff' : '#ecfccb',
                                                    color: isFaculty ? '#a21caf' : '#3f6212',
                                                    border: `1px solid ${isFaculty ? '#f0abfc' : '#d9f99d'}`,
                                                    padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontSize: '13px'
                                                }}>
                                                    {isFaculty ? <FaUserTie style={{ marginRight: '6px', fontSize: '11px' }} /> : <FaUserGraduate style={{ marginRight: '6px', fontSize: '11px' }} />}
                                                    <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                                                    <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.8 }}>({isFaculty ? 'Fac' : 'Stu'})</span>
                                                    <FaTrash
                                                        onClick={() => {
                                                            const newIds = uploadData.targetIndividualIds.filter(id => id !== u.id);
                                                            const newUsers = uploadData.selectedUsers.filter(user => user.id !== u.id);
                                                            setUploadData({ ...uploadData, targetIndividualIds: newIds, selectedUsers: newUsers });
                                                        }}
                                                        style={{ marginLeft: '8px', cursor: 'pointer', color: '#94a3b8' }} size={11}
                                                        onMouseOver={(e) => e.target.style.color = '#ef4444'}
                                                        onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* SECTION 2: FILE DETAILS */}
                        <div className="form-section">
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#334155' }}>2. Document Details</label>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Title</label>
                                    <input type="text" required value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Subject</label>
                                    <input type="text" required value={uploadData.subject} onChange={e => setUploadData({ ...uploadData, subject: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>File</label>
                                <input type="file" required onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })} style={{ display: 'block', marginTop: '5px' }} />
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right' }}>
                            <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' }}>
                                Upload Material
                            </button>
                        </div>

                    </form>
                </div>
            )}



            {/* --- MATERIALS LIST (Filtered) --- */}
            {activeTab !== 'upload' && (
                <div className="materials-list-wrapper">
                    {displayedMaterials.length > 0 ? (
                        <div className="items-grid">
                            {displayedMaterials.map((item) => (
                                <div key={item._id} className="doc-card" onClick={(e) => onPdfClick(item.fileId?.filePath, e)}>
                                    <div className="doc-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                        <FaBook />
                                    </div>
                                    <div className="doc-info">
                                        <span className="doc-title">{item.title}</span>
                                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{item.subject}</span>
                                        <span style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                            By: {item.uploadedBy?.username} ({item.uploadedBy?.subRole})
                                        </span>
                                        {/* Display Sharing Info */}
                                        <span style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {/* Specific Users Badge */}
                                            {item.targetIndividualIds?.length > 0 && <span style={{ background: '#dcfce7', padding: '2px 5px', borderRadius: '4px', color: '#166534' }}>Specific Users</span>}

                                            {/* Rules Badges */}
                                            {item.targetAudience?.map((rule, idx) => (
                                                <span key={idx} style={{ background: '#eee', padding: '2px 5px', borderRadius: '4px' }}>
                                                    {rule.role === 'Student' ? 'Stu' : 'Fac'}
                                                    {rule.subRole ? `-${rule.subRole}` : ''}
                                                    {rule.batch ? `-${rule.batch}` : ''}
                                                </span>
                                            ))}
                                        </span>
                                        <span className="click-hint">Click to view</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            {userRole === 'Student' && !viewFilters.batch ? "Enter Batch to filter." : "No materials found in this tab."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Extracted UserPicker Component to prevent re-renders losing state
const UserPicker = ({ uploadData, setUploadData, commonDepartments, userRole }) => {
    // If Student, force role to Student, else default to Student
    const [filters, setFilters] = useState({ role: 'Student', dept: 'All', batch: '', search: '' });
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Effect to enforce role constraint if props change (unlikely but safe)
    useEffect(() => {
        if (userRole === 'Student') {
            setFilters(prev => ({ ...prev, role: 'Student' }));
        }
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

            // Allow fetching if we have search term OR specific filters
            if (filters.dept === 'All' && !filters.search && !filters.batch) {
                // Maybe limit generic fetch
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
        <div className="user-picker" style={{ marginTop: '10px', border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#f9fafb' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Add Specific People</h4>

            {/* Filters */}
            <div className="picker-filters" style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <select
                    value={filters.role}
                    onChange={e => setFilters({ ...filters, role: e.target.value })}
                    disabled={userRole === 'Student'}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', background: userRole === 'Student' ? '#e2e8f0' : 'white' }}
                >
                    <option value="Student">Students</option>
                    <option value="Faculty">Faculty</option>
                </select>

                <select
                    value={filters.dept}
                    onChange={e => setFilters({ ...filters, dept: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="All">All Depts</option>
                    {commonDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {filters.role === 'Student' && (
                    <select
                        value={filters.batch}
                        onChange={e => setFilters({ ...filters, batch: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">Select Batch</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={`${year - 4}-${year}`}>{year - 4}-{year}</option>
                        ))}
                    </select>
                )}

                <input
                    type="text"
                    placeholder="Search ID/Name..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
                />
            </div>

            {/* User List */}
            <div className="user-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px', background: 'white' }}>
                {loadingUsers ? <p style={{ padding: '10px' }}>Loading...</p> : availableUsers.length > 0 ? availableUsers.map(user => (
                    <div key={user._id}
                        onClick={() => toggleUser(user)}
                        style={{
                            padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer',
                            background: uploadData.targetIndividualIds.includes(user.id) ? '#e0f2fe' : 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                        <span><b>{user.username}</b> ({user.id})</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{user.subRole} {user.batch ? `- ${user.batch}` : ''}</span>
                    </div>
                )) : <p style={{ padding: '10px', color: '#888', fontStyle: 'italic' }}>No users found.</p>}
            </div>
        </div>
    );
};

export default MaterialManager;
