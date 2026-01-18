import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaCheck, FaTimes, FaUserCog, FaSearch, FaUser, FaFilter, FaCalendarAlt, FaCheckSquare, FaSquare, FaLayerGroup } from 'react-icons/fa';
import './Achievements.css';
import '../Timetable/Timetable.css'; // Import Timetable styles for Access Control
import axios from 'axios';

const HODAchievementManager = ({ userRole, userId }) => {
    // Determine allowed tabs based on permissions relative to userId
    const [permissions, setPermissions] = useState({});

    // Derived permissions
    // USER UPDATE: All Faculty have access to Student and Faculty achievements by default now.
    const canSeeStudent = userRole === 'HOD' || userRole === 'Faculty';
    const canSeeFaculty = userRole === 'HOD' || userRole === 'Faculty';
    const canAccessControl = userRole === 'HOD';

    // Set initial tab based on permissions
    const [activeTab, setActiveTab] = useState('overview');

    const [overviewRoleFilter, setOverviewRoleFilter] = useState('All'); // 'All', 'Student', 'Faculty'
    const [overviewTimeFilter, setOverviewTimeFilter] = useState('All'); // 'All', '1M', '3M', '6M', '1Y'

    const [achievements, setAchievements] = useState([]);
    const [deptFaculty, setDeptFaculty] = useState([]);

    const studentCategories = [
        "Technical Certification",
        "Placements & Internships",
        "Competitions & Awards",
        "Sports & Cultural Events",
        "Innovation & Leadership"
    ];

    const facultyCategories = [
        "Research Publications",
        "Conference Presentations",
        "Intellectual Property",
        "Certifications & Online Courses",
        "Professional Development",
        "Research Consultancy",
        "Mentorship & Student Training",
        "Books & Literature"
    ];

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // UI State
    const [showFilters, setShowFilters] = useState(false);

    // Access Control UI State
    const [showAddForm, setShowAddForm] = useState(false);
    const [accessSearch, setAccessSearch] = useState('');

    useEffect(() => {
        // Load permisisons FIRST to determine correct initial tab
        loadPermissions();
    }, [userId]);

    useEffect(() => {
        // Redirect if on forbidden tab
        if (activeTab === 'students' && !canSeeStudent) {
            if (canSeeFaculty) setActiveTab('faculty');
            else if (canAccessControl) setActiveTab('access');
        } else if (activeTab === 'faculty' && !canSeeFaculty) {
            if (canSeeStudent) setActiveTab('students');
            else if (canAccessControl) setActiveTab('access');
        } else if (activeTab === 'access' && !canAccessControl) {
            if (canSeeStudent) setActiveTab('students');
            else if (canSeeFaculty) setActiveTab('faculty');
        }

        // Reset filter when tab changes
        setCategoryFilter('All');
        setSearchQuery('');
    }, [activeTab, permissions, userRole, canSeeStudent, canSeeFaculty, canAccessControl]);

    useEffect(() => {
        // Load data when tab changes (or on mount if tab is valid)
        if (activeTab === 'students' || activeTab === 'faculty' || activeTab === 'overview') {
            loadAchievements();
        }
        if (activeTab === 'access' && canAccessControl) {
            fetchFaculty();
        }
    }, [activeTab]);

    const loadAchievements = () => {
        const stored = localStorage.getItem('user_achievements');
        let currentData = [];

        if (stored) {
            try {
                currentData = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse achievements", e);
            }
        }

        // --- REALISTIC DATA INJECTION (If empty or needs top-up for demo) ---
        const fakeData = [
            {
                id: 'ach-101', title: 'Data Science Summit Speaker', type: 'Guest Lecture',
                issuingBody: 'Intl Data Corp', date: '2023-11-20', status: 'Pending',
                userId: 'FAC001', userName: 'Dr. Smith', userRole: 'Faculty'
            },
            {
                id: 'ach-102', title: 'National Hackathon Winner', type: 'Competitions & Awards',
                issuingBody: 'Tech India', date: '2023-10-15', status: 'Approved',
                userId: 'STU005', userName: 'Rahul Kumar', userRole: 'Student'
            },
            {
                id: 'ach-103', title: 'Published in IEEE Journal', type: 'Research Publications',
                issuingBody: 'IEEE', date: '2023-09-10', status: 'Pending',
                userId: 'FAC002', userName: 'Prof. Johnson', userRole: 'Faculty'
            },
            {
                id: 'ach-104', title: 'Best Student Project Award', type: 'Competitions & Awards',
                issuingBody: 'Anna University', date: '2023-12-01', status: 'Pending',
                userId: 'STU012', userName: 'Priya S.', userRole: 'Student'
            },
            {
                id: 'ach-105', title: 'Cloud Computing Certification', type: 'Technical Certification',
                issuingBody: 'Google Cloud', date: '2023-08-20', status: 'Rejected',
                userId: 'STU008', userName: 'Amit V.', userRole: 'Student'
            }
        ];

        const finalData = [...currentData];
        fakeData.forEach(fake => {
            if (!finalData.some(d => d.id === fake.id)) {
                finalData.push(fake);
            }
        });
        finalData.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAchievements(finalData);
    };

    const fetchFaculty = async () => {
        // Mock Faculty List
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
            try {
                const parsed = JSON.parse(storedPerms);
                const isNewFormat = Object.values(parsed).every(val => typeof val === 'object');
                if (isNewFormat) {
                    setPermissions(parsed);
                } else {
                    const migrated = {};
                    Object.keys(parsed).forEach(k => {
                        migrated[k] = { student: parsed[k], faculty: parsed[k] };
                    });
                    setPermissions(migrated);
                }
            } catch (e) {
                setPermissions({});
            }
        }
    };

    const handleApproval = (id, status) => {
        const updated = achievements.map(ach => {
            if (ach.id === id) {
                return { ...ach, status: status };
            }
            return ach;
        });
        setAchievements(updated);
        localStorage.setItem('user_achievements', JSON.stringify(updated));
    };

    const grantAccess = (facId) => {
        const newPerms = { ...permissions, [facId]: { student: true, faculty: false } };
        setPermissions(newPerms);
        localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
        setAccessSearch('');
        setShowAddForm(false);
    };

    const revokeAccess = (facId) => {
        const newPerms = { ...permissions };
        delete newPerms[facId];
        setPermissions(newPerms);
        localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
    };

    const togglePermissionType = (facId, type) => {
        const current = permissions[facId];
        if (!current) return;

        const updated = { ...current, [type]: !current[type] };
        const newPerms = { ...permissions, [facId]: updated };
        setPermissions(newPerms);
        localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
    };

    const getFilteredRequests = (role) => {
        return achievements.filter(ach => {
            const roleMatch = role === 'Student'
                ? (!ach.userRole || ach.userRole === 'Student')
                : ach.userRole === 'Faculty';

            if (!roleMatch) return false;

            const searchLower = searchQuery.toLowerCase();
            const textMatch =
                ach.title.toLowerCase().includes(searchLower) ||
                ach.type.toLowerCase().includes(searchLower) ||
                (ach.userName && ach.userName.toLowerCase().includes(searchLower));

            const categoryMatch = categoryFilter === 'All' ? true : ach.type === categoryFilter;

            return textMatch && categoryMatch;
        });
    };

    const getOverviewData = () => {
        return achievements.filter(ach => {
            // 1. Status Check: Must be Approved
            if (ach.status !== 'Approved') return false;

            // 2. Role FIlter
            if (overviewRoleFilter === 'Student' && ach.userRole !== 'Student') return false;
            if (overviewRoleFilter === 'Faculty' && ach.userRole !== 'Faculty') return false;

            // 3. Time Filter
            if (overviewTimeFilter !== 'All') {
                const achDate = new Date(ach.date);
                const now = new Date();
                const diffTime = Math.abs(now - achDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (overviewTimeFilter === '1M' && diffDays > 30) return false;
                if (overviewTimeFilter === '3M' && diffDays > 90) return false;
                if (overviewTimeFilter === '6M' && diffDays > 180) return false;
                if (overviewTimeFilter === '1Y' && diffDays > 365) return false;
            }

            // 4. Search Filter
            const searchLower = searchQuery.toLowerCase();
            const textMatch =
                ach.title.toLowerCase().includes(searchLower) ||
                ach.type.toLowerCase().includes(searchLower) ||
                (ach.userName && ach.userName.toLowerCase().includes(searchLower));

            return textMatch;
        });
    };

    // Calculate active approvers count
    const activeApprovers = Object.keys(permissions).filter(k => !!permissions[k]);
    const currentCategories = activeTab === 'students' ? studentCategories : facultyCategories;

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>Department Achievements</h2>
            </div>

            <div className="achievements-tabs">
                <button className={`std-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}>
                    <FaLayerGroup /> Overview
                </button>
                {canSeeStudent && (
                    <button className={`std-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setActiveTab('students'); setSearchQuery(''); }}>
                        <FaUserGraduate /> Student Achievements
                    </button>
                )}
                {canSeeFaculty && (
                    <button className={`std-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => { setActiveTab('faculty'); setSearchQuery(''); }}>
                        <FaChalkboardTeacher /> Faculty Achievements
                    </button>
                )}
                {canAccessControl && (
                    <button className={`std-tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>
                        <FaUserCog /> Access Control
                    </button>
                )}
            </div>

            {/* REQUESTS VIEWS */}
            {((activeTab === 'students' && canSeeStudent) || (activeTab === 'faculty' && canSeeFaculty) || activeTab === 'overview') && (
                <>
                    <div className="achievements-toolbar">
                        <div className="toolbar-text">
                            {activeTab === 'overview'
                                ? 'All Approved Department Achievements'
                                : `Manage ${activeTab === 'students' ? 'Student' : 'Faculty'} submissions`
                            }
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                className="std-input"
                                placeholder="Search achievements..."
                                style={{ width: '250px', padding: '8px 12px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* MULTI-FILTER TOGGLE (Only for Overview) */}
                            {activeTab === 'overview' && (
                                <button
                                    className={`std-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        backgroundColor: showFilters ? '#e0f2fe' : 'white',
                                        color: showFilters ? '#0284c7' : '#64748b',
                                        border: `1px solid ${showFilters ? '#0284c7' : '#cbd5e1'}`
                                    }}
                                >
                                    <FaFilter /> Filters
                                </button>
                            )}

                            {/* INLINE SINGLE FILTER (For Student/Faculty Tabs) */}
                            {activeTab !== 'overview' && (
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
                            )}
                        </div>
                    </div>

                    {/* FILTER PANEL (Only for Overview) */}
                    {showFilters && activeTab === 'overview' && (
                        <div className="filter-panel" style={{
                            display: 'flex',
                            gap: '20px',
                            backgroundColor: '#f8fafc',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #e2e8f0',
                            flexWrap: 'wrap'
                        }}>
                            {/* OVERVIEW FILTERS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>User Role</label>
                                <select
                                    className="std-select"
                                    style={{ width: '200px' }}
                                    value={overviewRoleFilter}
                                    onChange={(e) => setOverviewRoleFilter(e.target.value)}
                                >
                                    <option value="All">All Records</option>
                                    <option value="Student">Students Only</option>
                                    <option value="Faculty">Faculty Only</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Time Period</label>
                                <select
                                    className="std-select"
                                    style={{ width: '200px' }}
                                    value={overviewTimeFilter}
                                    onChange={(e) => setOverviewTimeFilter(e.target.value)}
                                >
                                    <option value="All">All Time</option>
                                    <option value="1M">Last Month</option>
                                    <option value="3M">Last 3 Months</option>
                                    <option value="6M">Last 6 Months</option>
                                    <option value="1Y">Last Year</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="achievements-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                        {(activeTab === 'overview' ? getOverviewData() : getFilteredRequests(activeTab === 'students' ? 'Student' : 'Faculty')).length === 0 ? (
                            <div className="empty-state">No achievements found matching your criteria.</div>
                        ) : (
                            (activeTab === 'overview' ? getOverviewData() : getFilteredRequests(activeTab === 'students' ? 'Student' : 'Faculty')).map(ach => (
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
                                        <div className="card-details" style={{ display: 'flex', gap: '15px', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUser /> <strong>{ach.userName || 'Unknown User'}</strong>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaCalendarAlt /> {ach.date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Only show Approve/Reject buttons in Manage Tabs, NOT Overview */}
                                    {activeTab !== 'overview' && (
                                        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                                            {ach.status !== 'Rejected' && (
                                                <button
                                                    className="std-btn"
                                                    style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fee2e2', padding: '8px 12px' }}
                                                    onClick={() => handleApproval(ach.id, 'Rejected')}
                                                    title="Reject Submission"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                            {ach.status !== 'Approved' && (
                                                <button
                                                    className="std-btn"
                                                    style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#dcfce7', padding: '8px 12px' }}
                                                    onClick={() => handleApproval(ach.id, 'Approved')}
                                                    title="Approve Submission"
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

            {/* ACCESS CONTROL VIEW */}
            {activeTab === 'access' && canAccessControl && (
                <div className="permission-manager">
                    {/* ... (Unchanged Access Control UI) ... */}
                    <div className="pm-header">
                        <h3 className="pm-title">Authorized Approvers ({activeApprovers.length})</h3>
                        <button className="std-btn" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel Adding' : '+ Add Person'}
                        </button>
                    </div>

                    {!showAddForm && (
                        <div className="faculty-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeApprovers.length > 0 && (
                                <div className="user-result-item" style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0' }}>
                                    <span style={{ flex: 1 }}>Faculty Member</span>
                                    <div style={{ display: 'flex', gap: '30px', marginRight: '60px' }}>
                                        <span style={{ width: '100px', textAlign: 'center' }}>Student Appr.</span>
                                        <span style={{ width: '100px', textAlign: 'center' }}>Faculty Appr.</span>
                                    </div>
                                    <span style={{ width: '30px' }}></span>
                                </div>
                            )}

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
                                                <div
                                                    className="perm-toggle"
                                                    onClick={() => togglePermissionType(fac.id, 'student')}
                                                    style={{ width: '100px', display: 'flex', justifyContent: 'center', cursor: 'pointer', color: p.student ? '#16a34a' : '#cbd5e1' }}
                                                    title="Toggle Student Approval Right"
                                                >
                                                    {p.student ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
                                                </div>

                                                <div
                                                    className="perm-toggle"
                                                    onClick={() => togglePermissionType(fac.id, 'faculty')}
                                                    style={{ width: '100px', display: 'flex', justifyContent: 'center', cursor: 'pointer', color: p.faculty ? '#16a34a' : '#cbd5e1' }}
                                                    title="Toggle Faculty Approval Right"
                                                >
                                                    {p.faculty ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
                                                </div>
                                            </div>

                                            <button
                                                className="std-btn"
                                                style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}
                                                onClick={() => revokeAccess(fac.id)}
                                                title="Revoke All Access"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="empty-msg">No faculty members currently have approval access.</p>
                            )}
                        </div>
                    )}

                    {showAddForm && (
                        <div className="user-picker-box">
                            <div className="targets-label">Search Faculty to Add</div>
                            <div className="picker-filters-row">
                                <input
                                    type="text"
                                    className="picker-input"
                                    placeholder="Search Name or ID..."
                                    value={accessSearch}
                                    onChange={e => setAccessSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="user-results-list">
                                {deptFaculty
                                    .filter(f => !permissions[f.id])
                                    .filter(f => f.username.toLowerCase().includes(accessSearch.toLowerCase()))
                                    .map(fac => (
                                        <div key={fac.id} className="user-result-item" onClick={() => grantAccess(fac.id)}>
                                            <span><b>{fac.username}</b> ({fac.id})</span>
                                            <span style={{ color: '#059669', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', backgroundColor: '#dcfce7', borderRadius: '4px' }}>
                                                + Grant Access
                                            </span>
                                        </div>
                                    ))}
                                {deptFaculty.filter(f => !permissions[f.id]).length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                        All available faculty already have access.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HODAchievementManager;
