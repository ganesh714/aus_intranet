import React from 'react';
import axios from 'axios';
import './Dashboard.css';
import {
    FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaTrophy,
    FaCalendarAlt, FaBullhorn, FaArrowRight, FaClock, FaFileUpload, FaDatabase, FaBook
} from 'react-icons/fa';

const Dashboard = ({
    userRole,
    userId,
    userSubRole,
    onPersonalDataClick,
    onAchievementsClick,
    onSendAnnounceClick,
    onViewAnnouncementsClick,
    onDirectCategoryClick // For Time Table, Material etc.
}) => {



    // --- STATE & DATA FETCHING ---
    const [statsData, setStatsData] = React.useState({
        announcements: 0,
        sharedResources: 0,
        storageUsed: 0,
        facultyCount: 0
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch user batch if needed, but for now we rely on backend valid lookup or passed params if we had them.
                // We don't have batch in props readily available unless we read sessionStorage or fetch user first.
                // Let's rely on backend user lookup for batch.

                const response = await axios.get(`http://localhost:5001/dashboard/stats`, {
                    params: {
                        role: userRole,
                        subRole: userSubRole,
                        id: userId
                    }
                });
                setStatsData(response.data);
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            }
        };

        if (userId) {
            fetchStats();
        }
    }, [userRole, userSubRole, userId]);


    // Helper to format bytes
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // --- MOCK DATA (Merged with Real Data) ---
    const stats = {
        Student: [
            // Removed Attendance, Assignments, Classes
            { id: 1, label: 'My Achievements', value: '5', icon: <FaTrophy />, color: '#10b981' }, // Static
            { id: 2, label: 'Announcements', value: statsData.announcements || '0', icon: <FaBullhorn />, color: '#f59e0b' }, // Dynamic
            { id: 3, label: 'Shared Resources', value: statsData.sharedResources || '0', icon: <FaBook />, color: '#3b82f6' }, // Dynamic
        ],
        Faculty: [
            { id: 1, label: 'Pending Approvals', value: '2', icon: <FaClipboardList />, color: '#ef4444' }, // Static
            { id: 2, label: 'Dept. Achievements', value: '12', icon: <FaTrophy />, color: '#f59e0b' }, // Static
            { id: 3, label: 'Storage Used', value: formatBytes(statsData.storageUsed), icon: <FaDatabase />, color: '#6366f1' } // Dynamic
        ],
        HOD: [
            { id: 1, label: 'Faculty Count', value: statsData.facultyCount || '0', icon: <FaChalkboardTeacher />, color: '#3b82f6' }, // Dynamic
            { id: 2, label: 'Dept. Achievements', value: '15', icon: <FaTrophy />, color: '#f59e0b' }, // Static
            { id: 3, label: 'Pending Requests', value: '5', icon: <FaClipboardList />, color: '#ef4444' }, // Static
            { id: 4, label: 'Storage Used', value: formatBytes(statsData.storageUsed), icon: <FaDatabase />, color: '#6366f1' } // Dynamic
        ]
    };

    const currentStats = stats[userRole] || stats['Student'];

    return (
        <div className="dashboard-container">
            {/* 1. Header Section */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="welcome-text">Overview of your activity and university updates.</p>
                </div>
                <div className="date-display">
                    <FaCalendarAlt /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="stats-grid">
                {currentStats.map((stat) => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Main Content Widgets (Split View) */}
            <div className="dashboard-widgets">

                {/* Left Column: Recent Activity / Announcements */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h2><FaBullhorn className="widget-icon" /> Recent Announcements</h2>
                        <button className="view-all-btn" onClick={onViewAnnouncementsClick}>
                            View All <FaArrowRight />
                        </button>
                    </div>
                    <div className="activity-list">
                        {statsData.recentAnnouncements && statsData.recentAnnouncements.length > 0 ? (
                            statsData.recentAnnouncements.map(item => {
                                const dateObj = new Date(item.uploadedAt);
                                const month = dateObj.toLocaleString('default', { month: 'short' });
                                const day = dateObj.getDate();

                                return (
                                    <div key={item._id} className="activity-item">
                                        <div className="activity-date">
                                            <span>{month}</span>
                                            <strong>{day}</strong>
                                        </div>
                                        <div className="activity-content">
                                            <h4>{item.title}</h4>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '10px' }}>No recent announcements.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions (For All Roles now since Schedule is removed) */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h2><FaFileUpload className="widget-icon" /> Quick Actions</h2>
                    </div>
                    <div className="quick-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>

                        {/* Student Actions */}
                        {userRole === 'Student' && (
                            <>
                                <button className="action-btn" onClick={() => onDirectCategoryClick('Material')}>
                                    <FaBook /> Shared Docs
                                </button>
                                <button className="action-btn" onClick={onAchievementsClick}>
                                    <FaTrophy /> My Achievements
                                </button>
                            </>
                        )}

                        {/* Faculty/HOD Actions */}
                        {userRole !== 'Student' && (
                            <>
                                <button className="action-btn" onClick={onSendAnnounceClick}>
                                    <FaBullhorn /> Post Notice
                                </button>
                                <button className="action-btn" onClick={() => onDirectCategoryClick('Teaching Material')}>
                                    <FaFileUpload /> Upload Material
                                </button>
                                {(userRole === 'Faculty' || userRole === 'HOD') &&
                                    <button className="action-btn" onClick={onAchievementsClick}>
                                        <FaTrophy /> Add Achievement
                                    </button>
                                }
                            </>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;