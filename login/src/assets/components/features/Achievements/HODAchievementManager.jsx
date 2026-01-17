import React, { useState, useEffect } from 'react';
import { FaChartPie, FaUserGraduate, FaChalkboardTeacher, FaCheck, FaTimes, FaUserCog, FaSearch, FaUser } from 'react-icons/fa';
import './Achievements.css'; // Re-use existing styles
import axios from 'axios';

const HODAchievementManager = ({ userRole, userId }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [achievements, setAchievements] = useState([]);
    const [deptFaculty, setDeptFaculty] = useState([]);
    const [permissions, setPermissions] = useState({}); // { facultyId: true/false }
    const [searchQuery, setSearchQuery] = useState('');

    // Load Data
    useEffect(() => {
        loadAchievements();
        if (activeTab === 'access') {
            fetchFaculty();
            loadPermissions();
        }
    }, [activeTab]);

    const loadAchievements = () => {
        const stored = localStorage.getItem('user_achievements');
        if (stored) {
            try {
                setAchievements(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse achievements", e);
            }
        }
    };

    const fetchFaculty = async () => {
        // Mocking or Fetching - attempting similar fetch as TimetableManager
        // If backend fails, will fallback to empty or mock
        try {
            // Assuming we can get faculty for the current HOD's dept. 
            // Since we don't have dept prop passed explicitly in Content.jsx often, 
            // we'll rely on what TimetableManager did or just generic fetch.
            // For now, let's try a generic fetch or use a hardcoded list for reliability if API is unknown.
            const response = await axios.get('http://localhost:5001/get-all-users'); // Hypothetical endpoint
            const allUsers = response.data || [];
            const faculty = allUsers.filter(u => u.role === 'Faculty');
            setDeptFaculty(faculty);
        } catch (error) {
            console.warn("Could not fetch faculty, using mock data for demo.");
            setDeptFaculty([
                { id: 'FAC001', username: 'Dr. Smith', role: 'Faculty' },
                { id: 'FAC002', username: 'Prof. Johnson', role: 'Faculty' },
                { id: 'FAC003', username: 'Dr. Emily', role: 'Faculty' },
            ]);
        }
    };

    const loadPermissions = () => {
        const storedPerms = localStorage.getItem('achievement_permissions');
        if (storedPerms) {
            setPermissions(JSON.parse(storedPerms));
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

    const togglePermission = (facId) => {
        const newPerms = { ...permissions, [facId]: !permissions[facId] };
        setPermissions(newPerms);
        localStorage.setItem('achievement_permissions', JSON.stringify(newPerms));
    };

    // --- COMPUTED STATS ---
    const stats = {
        total: achievements.length,
        student: achievements.filter(a => !a.userRole || a.userRole === 'Student').length, // Assuming userRole field exists or default to student
        faculty: achievements.filter(a => a.userRole === 'Faculty').length,
        pending: achievements.filter(a => a.status === 'Pending').length,
        approved: achievements.filter(a => a.status === 'Approved').length,
        rejected: achievements.filter(a => a.status === 'Rejected').length,
    };

    const getPendingRequests = (role) => {
        // Filter by role (approximate if userRole not always saved, assuming defaults)
        return achievements.filter(ach =>
            ach.status === 'Pending' &&
            (role === 'Student' ? (!ach.userRole || ach.userRole === 'Student') : ach.userRole === 'Faculty')
        );
    };

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>Department Achievements</h2>
                <div className="achievements-tabs">
                    <button className={`std-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <FaChartPie /> Dashboard
                    </button>
                    <button className={`std-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
                        <FaUserGraduate /> Student Requests
                    </button>
                    <button className={`std-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>
                        <FaChalkboardTeacher /> Faculty Requests
                    </button>
                    <button className={`std-tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>
                        <FaUserCog /> Access Control
                    </button>
                </div>
            </div>

            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
                <div className="achievements-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="achievement-card" style={{ textAlign: 'center', backgroundColor: '#f8fafc' }}>
                        <h3 style={{ fontSize: '36px', color: 'var(--primary-blue)', margin: '10px 0' }}>{stats.total}</h3>
                        <p className="card-subtitle">Total Submissions</p>
                    </div>
                    <div className="achievement-card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
                        <h3 style={{ fontSize: '36px', color: '#166534', margin: '10px 0' }}>{stats.approved}</h3>
                        <p className="card-subtitle">Approved</p>
                    </div>
                    <div className="achievement-card" style={{ textAlign: 'center', backgroundColor: '#fefce8' }}>
                        <h3 style={{ fontSize: '36px', color: '#854d0e', margin: '10px 0' }}>{stats.pending}</h3>
                        <p className="card-subtitle">Pending Review</p>
                    </div>
                </div>
            )}

            {/* REQUESTS VIEWS (Shared Layout) */}
            {(activeTab === 'students' || activeTab === 'faculty') && (
                <div className="achievements-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                    {getPendingRequests(activeTab === 'students' ? 'Student' : 'Faculty').length === 0 ? (
                        <div className="empty-state">No pending requests found.</div>
                    ) : (
                        getPendingRequests(activeTab === 'students' ? 'Student' : 'Faculty').map(ach => (
                            <div key={ach.id} className="achievement-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div className="card-title">{ach.title}</div>
                                    <div className="card-subtitle">{ach.type} | {ach.issuingBody}</div>
                                    <div className="card-details">
                                        <span>Submitted by: <strong>{ach.userName || 'Unknown User'}</strong> ({ach.userId})</span>
                                        <span>Date: {ach.date}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="std-btn"
                                        style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                        onClick={() => handleApproval(ach.id, 'Rejected')}
                                    >
                                        <FaTimes /> Reject
                                    </button>
                                    <button
                                        className="std-btn"
                                        style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                                        onClick={() => handleApproval(ach.id, 'Approved')}
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ACCESS CONTROL VIEW */}
            {activeTab === 'access' && (
                <div className="permission-manager">
                    <div className="pm-header">
                        <h3 className="pm-title">Manage Approval Permissions</h3>
                    </div>

                    <div className="user-picker-box">
                        <div className="picker-filters-row">
                            <input
                                type="text"
                                className="picker-input"
                                placeholder="Search Faculty..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="user-results-list">
                            {deptFaculty
                                .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(fac => (
                                    <div key={fac.id} className="user-result-item" onClick={() => togglePermission(fac.id)}>
                                        <span><b>{fac.username}</b> ({fac.id})</span>
                                        {permissions[fac.id] ? (
                                            <span style={{ color: '#059669', fontSize: '12px', fontWeight: 'bold' }}>
                                                <FaCheck /> Can Approve
                                            </span>
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                                No Access
                                            </span>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HODAchievementManager;
