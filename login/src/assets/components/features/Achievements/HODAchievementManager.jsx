import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCheck, FaTimes, FaUserCog, FaSearch, FaUser, FaFilter, FaCalendarAlt, FaCheckSquare, FaSquare, FaLayerGroup, FaClipboardList } from 'react-icons/fa';
import './Achievements.css';
import '../Timetable/Timetable.css'; // Import Timetable styles for Access Control
import axios from 'axios';

const HODAchievementManager = ({ userRole, userId }) => {
    // Determine allowed tabs based on permissions relative to userId
    const [permissions, setPermissions] = useState({});

    // Derived permissions
    const canSeeStudent = userRole === 'HOD' || userRole === 'Faculty';
    const canSeeFaculty = userRole === 'HOD' || userRole === 'Faculty';
    const canAccessControl = userRole === 'HOD';

    // Set initial tab based on permissions
    // New Tabs: 'student_overview', 'faculty_overview', 'approvals', 'access'
    const [activeTab, setActiveTab] = useState('student_overview');

    // Filter State
    const [approvalRoleFilter, setApprovalRoleFilter] = useState('Student'); // 'Student', 'Faculty' (For Approvals Tab)
    const [timeFilter, setTimeFilter] = useState('All'); // 'All', '1M', '3M'... (For Overview Tabs)
    const [categoryFilter, setCategoryFilter] = useState('All'); // Shared category filter

    // Common Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Data State
    const [achievements, setAchievements] = useState([]);
    const [deptFaculty, setDeptFaculty] = useState([]);

    // Access Control UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [accessSearch, setAccessSearch] = useState('');

    const studentCategories = [
        "Technical Certification", "Placements & Internships",
        "Competitions & Awards", "Sports & Cultural Events", "Innovation & Leadership"
    ];

    const facultyCategories = [
        "Research Publications", "Conference Presentations", "Intellectual Property",
        "Certifications & Online Courses", "Professional Development", "Research Consultancy"
    ];

    useEffect(() => {
        loadPermissions();
    }, [userId]);

    useEffect(() => {
        // Simple permission check redirect
        if (activeTab === 'student_overview' && !canSeeStudent) setActiveTab('approvals');

        // Reset filters on tab change
        setCategoryFilter('All');
        setSearchQuery('');
        setTimeFilter('All');
        setApprovalRoleFilter('Student'); // Default for approvals
        setShowFilters(false);
    }, [activeTab, permissions, userRole]);

    // Reset Category when Role changes in Approvals
    useEffect(() => {
        if (activeTab === 'approvals') {
            setCategoryFilter('All');
        }
    }, [approvalRoleFilter]);

    useEffect(() => {
        if (activeTab !== 'access') {
            loadAchievements();
        } else if (canAccessControl) {
            fetchFaculty();
        }
    }, [activeTab]);

    const loadAchievements = () => {
        const stored = localStorage.getItem('user_achievements');
        let currentData = [];
        if (stored) {
            try { currentData = JSON.parse(stored); } catch (e) { }
        }

        // --- REALISTIC DATA INJECTION (If empty or needs top-up for demo) ---
        const fakeData = [
            // --- APPROVED FACULTY (For Faculty Tab) ---
            { id: 'ach-101', title: 'Data Science Summit Keynote', type: 'Guest Lecture', issuingBody: 'Intl Data Corp', date: '2023-11-20', status: 'Approved', approvedBy: 'Dr. HOD (HOD)', userId: 'FAC001', userName: 'Dr. Smith', userRole: 'Faculty' },
            { id: 'ach-103', title: 'Published in IEEE Journal', type: 'Research Publications', issuingBody: 'IEEE', date: '2023-09-10', status: 'Approved', approvedBy: 'Dr. HOD (HOD)', userId: 'FAC002', userName: 'Prof. Johnson', userRole: 'Faculty' },
            { id: 'ach-106', title: 'AI Ethics Workshop Lead', type: 'Professional Development', issuingBody: 'AI Safety Inst', date: '2023-12-05', status: 'Approved', approvedBy: 'Prof. Alan (Faculty)', userId: 'FAC003', userName: 'Dr. Emily', userRole: 'Faculty' },
            { id: 'ach-107', title: 'Patent Granted: IoT Security', type: 'Intellectual Property', issuingBody: 'USPTO', date: '2023-10-22', status: 'Approved', approvedBy: 'Dr. HOD (HOD)', userId: 'FAC001', userName: 'Dr. Smith', userRole: 'Faculty' },

            // --- APPROVED STUDENTS (For Student Tab) ---
            { id: 'ach-102', title: 'National Hackathon Winner', type: 'Competitions & Awards', issuingBody: 'Tech India', date: '2023-10-15', status: 'Approved', approvedBy: 'Dr. Smith (Faculty)', userId: 'STU005', userName: 'Rahul Kumar', userRole: 'Student' },
            { id: 'ach-108', title: 'Google Summer of Code', type: 'Placements & Internships', issuingBody: 'Google', date: '2023-08-15', status: 'Approved', approvedBy: 'Prof. Johnson (Faculty)', userId: 'STU015', userName: 'Anita Raj', userRole: 'Student' },

            // --- PENDING REQUESTS (For Approvals Tab) ---
            // Faculty Pending
            { id: 'ach-109', title: 'Research Grant: Green Energy', type: 'Research Consultancy', issuingBody: 'Dept of Science', date: '2024-01-10', status: 'Pending', userId: 'FAC004', userName: 'Prof. Alan', userRole: 'Faculty' },
            { id: 'ach-110', title: 'Certified Kubernetes Admin', type: 'Certifications & Online Courses', issuingBody: 'CNCF', date: '2024-01-12', status: 'Pending', userId: 'FAC005', userName: 'Dr. Rose', userRole: 'Faculty' },

            // Student Pending
            { id: 'ach-104', title: 'Best Student Project Award', type: 'Competitions & Awards', issuingBody: 'Anna University', date: '2023-12-01', status: 'Pending', userId: 'STU012', userName: 'Priya S.', userRole: 'Student' },
            { id: 'ach-105', title: 'Cloud Computing Certification', type: 'Technical Certification', issuingBody: 'Google Cloud', date: '2023-08-20', status: 'Pending', userId: 'STU008', userName: 'Amit V.', userRole: 'Student' },
            { id: 'ach-111', title: 'Inter-College Football Winner', type: 'Sports & Cultural Events', issuingBody: 'Sports Authority', date: '2024-01-05', status: 'Pending', userId: 'STU020', userName: 'Karthik M.', userRole: 'Student' }
        ];

        const finalData = [...currentData];
        fakeData.forEach(fake => {
            const index = finalData.findIndex(d => d.id === fake.id);
            if (index !== -1) {
                // If it exists, update it with new fake props (to ensure fields like approvedBy are added)
                finalData[index] = { ...finalData[index], ...fake };
            } else {
                finalData.push(fake);
            }
        });
        finalData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAchievements(finalData);
    };

    const fetchFaculty = async () => {
        setDeptFaculty([
            { id: 'FAC001', username: 'Dr. Smith', role: 'Faculty' },
            { id: 'FAC002', username: 'Prof. Johnson', role: 'Faculty' },
            { id: 'FAC003', username: 'Dr. Emily', role: 'Faculty' },
            { id: 'FAC004', username: 'Prof. Alan', role: 'Faculty' },
            { id: 'FAC005', username: 'Dr. Rose', role: 'Faculty' },
        ]);
    };

    const loadPermissions = () => {
        const storedPerms = localStorage.getItem('achievement_permissions');
        if (storedPerms) {
            try { setPermissions(JSON.parse(storedPerms)); } catch (e) { }
        }
    };

    const handleApproval = (id, status) => {
        const approverName = sessionStorage.getItem('username') || 'Unknown';
        const approverRole = sessionStorage.getItem('userRole') || '';
        const approvedByString = `${approverName} (${approverRole})`;

        const updated = achievements.map(ach => ach.id === id ? { ...ach, status: status, approvedBy: status === 'Approved' ? approvedByString : null } : ach);
        setAchievements(updated);
        localStorage.setItem('user_achievements', JSON.stringify(updated));
    };

    // --- ACCESS CONTROL HELPERS (Same as before) ---
    const grantAccess = (facId) => {
        const newPerms = { ...permissions, [facId]: { student: true, faculty: false } };
        setPermissions(newPerms); localStorage.setItem('achievement_permissions', JSON.stringify(newPerms)); setShowAddForm(false);
    };
    const revokeAccess = (facId) => {
        const newPerms = { ...permissions }; delete newPerms[facId];
        setPermissions(newPerms); localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
    };
    const togglePermissionType = (facId, type) => {
        const current = permissions[facId]; if (!current) return;
        const newPerms = { ...permissions, [facId]: { ...current, [type]: !current[type] } };
        setPermissions(newPerms); localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
    };

    // --- DATA FILTERS ---

    // 1. Get Approved Data (For Overviews)
    const getApprovedData = (targetRole) => {
        return achievements.filter(ach => {
            // Must be Approved AND correct role
            if (ach.status !== 'Approved') return false;
            if (ach.userRole !== targetRole) return false;

            // Time Filter
            if (timeFilter !== 'All') {
                const achDate = new Date(ach.date);
                const now = new Date();
                const diffDays = Math.ceil(Math.abs(now - achDate) / (1000 * 60 * 60 * 24));
                if (timeFilter === '1M' && diffDays > 30) return false;
                if (timeFilter === '3M' && diffDays > 90) return false;
                if (timeFilter === '6M' && diffDays > 180) return false;
                if (timeFilter === '1Y' && diffDays > 365) return false;
            }

            // Search
            const searchLower = searchQuery.toLowerCase();
            return (
                ach.title.toLowerCase().includes(searchLower) ||
                ach.type.toLowerCase().includes(searchLower) ||
                (ach.userName && ach.userName.toLowerCase().includes(searchLower))
            );
        });
    };

    // 2. Get Pending Data (For Approvals Tab)
    const getPendingData = () => {
        return achievements.filter(ach => {
            // Must NOT be Approved
            if (ach.status === 'Approved') return false;

            // Filter by selected role in the Approvals tab
            if (approvalRoleFilter === 'Student' && ach.userRole !== 'Student') return false;
            if (approvalRoleFilter === 'Faculty' && ach.userRole !== 'Faculty') return false;

            // Filter by Category
            if (categoryFilter !== 'All' && ach.type !== categoryFilter) return false;

            // Search
            const searchLower = searchQuery.toLowerCase();
            return (
                ach.title.toLowerCase().includes(searchLower) ||
                ach.type.toLowerCase().includes(searchLower) ||
                (ach.userName && ach.userName.toLowerCase().includes(searchLower))
            );
        });
    };

    // Determine which data to show
    let displayData = [];
    if (activeTab === 'student_overview') displayData = getApprovedData('Student');
    else if (activeTab === 'faculty_overview') displayData = getApprovedData('Faculty');
    else if (activeTab === 'approvals') displayData = getPendingData();

    // Helper for active approvers
    const activeApprovers = Object.keys(permissions).filter(k => !!permissions[k]);

    // Get current categories based on selected role in approvals
    const currentCategories = approvalRoleFilter === 'Student' ? studentCategories : facultyCategories;

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>Department Achievements</h2>
            </div>

            <div className="achievements-tabs">
                {/* 1. Student Overview */}
                {canSeeStudent && (
                    <button className={`std-tab-btn ${activeTab === 'student_overview' ? 'active' : ''}`} onClick={() => { setActiveTab('student_overview'); setSearchQuery(''); }}>
                        <FaUserGraduate /> Student Achievements
                    </button>
                )}
                {/* 2. Faculty Overview */}
                {canSeeFaculty && (
                    <button className={`std-tab-btn ${activeTab === 'faculty_overview' ? 'active' : ''}`} onClick={() => { setActiveTab('faculty_overview'); setSearchQuery(''); }}>
                        <FaChalkboardTeacher /> Faculty Achievements
                    </button>
                )}
                {/* 3. Approvals (Merged) */}
                <button className={`std-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => { setActiveTab('approvals'); setSearchQuery(''); }}>
                    <FaClipboardList /> Approvals
                </button>

                {/* 4. Access Control */}
                {canAccessControl && (
                    <button className={`std-tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>
                        <FaUserCog /> Access Control
                    </button>
                )}
            </div>

            {/* REQUESTS VIEWS */}
            {activeTab !== 'access' && (
                <>
                    <div className="achievements-toolbar">
                        <div className="toolbar-text">
                            {activeTab === 'student_overview' && 'All Approved Student Achievements'}
                            {activeTab === 'faculty_overview' && 'All Approved Faculty Achievements'}
                            {activeTab === 'approvals' && 'Pending Approval Requests'}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                className="std-input"
                                placeholder="Search..."
                                style={{ width: '250px', padding: '8px 12px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* INLINE TIME FILTER (For Overview Tabs - Single Filter) */}
                            {(activeTab === 'student_overview' || activeTab === 'faculty_overview') && (
                                <select
                                    className="std-select"
                                    style={{ width: '150px' }}
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                >
                                    <option value="All">All Time</option>
                                    <option value="1M">Last Month</option>
                                    <option value="3M">Last 3 Months</option>
                                    <option value="6M">Last 6 Months</option>
                                    <option value="1Y">Last Year</option>
                                </select>
                            )}

                            {/* FILTER TOGGLE BUTTON (Only for Approvals - Multi Filter) */}
                            {activeTab === 'approvals' && (
                                <button
                                    className={`std-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        backgroundColor: showFilters ? '#e0f2fe' : 'white',
                                        color: showFilters ? '#0284c7' : '#64748b',
                                        border: `1px solid ${showFilters ? '#0284c7' : '#cbd5e1'}`
                                    }}
                                >
                                    <FaFilter /> Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* FILTER PANEL (Only for Approvals) */}
                    {showFilters && activeTab === 'approvals' && (
                        <div className="filter-panel" style={{
                            display: 'flex', gap: '20px', backgroundColor: '#f8fafc',
                            padding: '15px', borderRadius: '8px', marginBottom: '20px',
                            border: '1px solid #e2e8f0', flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Filter by Role</label>
                                <select
                                    className="std-select"
                                    style={{ width: '200px' }}
                                    value={approvalRoleFilter}
                                    onChange={(e) => setApprovalRoleFilter(e.target.value)}
                                >
                                    <option value="Student">Students</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </div>

                            {/* NEW: Category Filter */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Category</label>
                                <select
                                    className="std-select"
                                    style={{ width: '250px' }}
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    {currentCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="achievements-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                        {displayData.length === 0 ? (
                            <div className="empty-state">No records found.</div>
                        ) : (
                            displayData.map(ach => (
                                <div key={ach.id} className="achievement-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="card-title">{ach.title}</div>
                                            <span className={`status-badge status-${ach.status ? ach.status.toLowerCase() : 'pending'}`} style={{ position: 'static', marginTop: 0 }}>
                                                {ach.status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="card-subtitle" style={{ color: 'var(--primary-orange)' }}>
                                            {ach.type} | {ach.issuingBody}
                                        </div>
                                        <div className="card-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b' }}>
                                            {/* Row 1: User */}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUser /> <strong>{ach.userName || 'Unknown User'}</strong>
                                            </span>

                                            {/* Row 2: Date & Approved By */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCalendarAlt /> {ach.date}
                                                </span>
                                                {/* Show Approved By */}
                                                {ach.status === 'Approved' && ach.approvedBy && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontWeight: '500' }}>
                                                        <FaCheckSquare /> Approved by: {ach.approvedBy}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS: Only in Approvals Tab */}
                                    {activeTab === 'approvals' && (
                                        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                            {ach.status !== 'Rejected' && (
                                                <button
                                                    className="std-btn"
                                                    style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fee2e2', padding: '8px 12px' }}
                                                    onClick={() => handleApproval(ach.id, 'Rejected')}
                                                    title="Reject"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                            {ach.status !== 'Approved' && (
                                                <button
                                                    className="std-btn"
                                                    style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#dcfce7', padding: '8px 12px' }}
                                                    onClick={() => handleApproval(ach.id, 'Approved')}
                                                    title="Approve"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ACCESS CONTROL VIEW - UNCHANGED */}
            {activeTab === 'access' && canAccessControl && (
                <div className="permission-manager">
                    {/* ... Same Access Control UI as before ... */}
                    <div className="pm-header">
                        <h3 className="pm-title">Authorized Approvers ({activeApprovers.length})</h3>
                        <button className="std-btn" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel Adding' : '+ Add Person'}
                        </button>
                    </div>

                    {!showAddForm && (
                        <div className="faculty-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeApprovers.length > 0 ? (
                                deptFaculty.filter(f => permissions[f.id]).map(fac => {
                                    const p = permissions[fac.id];
                                    return (
                                        <div key={fac.id} className="user-result-item">
                                            <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaUser /> <b>{fac.username}</b>
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#666', marginLeft: '24px' }}>({fac.id})</span>
                                            </span>
                                            <div style={{ display: 'flex', gap: '30px', marginRight: '60px' }}>
                                                <div className="perm-toggle" onClick={() => togglePermissionType(fac.id, 'student')} style={{ color: p.student ? '#16a34a' : '#cbd5e1' }}>
                                                    {p.student ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
                                                </div>
                                                <div className="perm-toggle" onClick={() => togglePermissionType(fac.id, 'faculty')} style={{ color: p.faculty ? '#16a34a' : '#cbd5e1' }}>
                                                    {p.faculty ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
                                                </div>
                                            </div>
                                            <button className="std-btn" style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }} onClick={() => revokeAccess(fac.id)}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : <p className="empty-msg">No faculty members currently have approval access.</p>}
                        </div>
                    )}
                    {showAddForm && (
                        <div className="user-picker-box">
                            <input type="text" className="picker-input" placeholder="Search..." value={accessSearch} onChange={e => setAccessSearch(e.target.value)} autoFocus />
                            <div className="user-results-list">
                                {deptFaculty.filter(f => !permissions[f.id] && f.username.toLowerCase().includes(accessSearch.toLowerCase())).map(fac => (
                                    <div key={fac.id} className="user-result-item" onClick={() => grantAccess(fac.id)}>
                                        <span><b>{fac.username}</b> ({fac.id})</span>
                                        <span style={{ color: '#059669', fontSize: '13px', fontWeight: 'bold' }}>+ Grant Access</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HODAchievementManager;
