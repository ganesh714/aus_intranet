import React from 'react';
import './Dashboard.css';
import {
    FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaTrophy,
    FaCalendarAlt, FaBullhorn, FaArrowRight, FaClock, FaFileUpload, FaDatabase, FaBook,
    FaCheckCircle, FaExclamationCircle, FaUserTie
} from 'react-icons/fa';

const Dashboard = ({
    userRole,
    userId,
    userSubRole,
    onPersonalDataClick,
    onAchievementsClick,
    onSendAnnounceClick,
    onViewAnnouncementsClick,
    onDirectCategoryClick
}) => {

    // --- STATE & DATA FETCHING ---
    const [statsData, setStatsData] = React.useState({
        announcements: 0,
        sharedResources: 0,
        storageUsed: 0,
        facultyCount: 25, // Mock
        studentCount: 450, // Mock
        pendingApprovals: 0,
        myAchievements: 0,
        recentAnnouncements: []
    });

    const [studentMockStats] = React.useState({
        attendance: 87,
        cgpa: 8.2,
        pendingAssignments: 3
    });

    React.useEffect(() => {
        const loadDashboardData = () => {
            try {
                // 1. Load Announcements
                const storedAnnouncements = localStorage.getItem('announcements');
                let announcements = [];
                if (storedAnnouncements) {
                    announcements = JSON.parse(storedAnnouncements);
                }

                // 2. Load Achievements (For Pending Approvals & My Counts)
                const storedAchievements = localStorage.getItem('user_achievements');
                let achievements = [];
                if (storedAchievements) {
                    achievements = JSON.parse(storedAchievements);
                }

                // Calculate Metrics
                let pendingCount = 0;
                let myAchCount = 0;

                if (userRole === 'Student') {
                    // Count my achievements
                    myAchCount = achievements.filter(a => a.userId === userId).length;
                } else if (userRole === 'Faculty') {
                    // Pending Student requests
                    pendingCount = achievements.filter(a => a.userRole === 'Student' && a.status === 'Pending').length;
                    // My achievements
                    myAchCount = achievements.filter(a => a.userId === userId).length;
                } else if (userRole === 'HOD') {
                    // All pending requests
                    pendingCount = achievements.filter(a => a.status === 'Pending').length;
                }

                setStatsData({
                    announcements: announcements.length,
                    sharedResources: 15, // Mock for now
                    storageUsed: 450 * 1024 * 1024, // Mock 450MB
                    facultyCount: 28,
                    studentCount: 512,
                    pendingApprovals: pendingCount,
                    myAchievements: myAchCount,
                    recentAnnouncements: announcements.reverse().slice(0, 3) // Top 3 Recent
                });

            } catch (error) {
                console.error("Error loading dashboard data from local storage", error);
            }
        };

        loadDashboardData();
    }, [userRole, userId]);


    // Helper to format bytes
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // --- CONFIGURABLE STATS CARDS ---
    const stats = {
        Student: [
            { id: 1, label: 'Attendance', value: `${studentMockStats.attendance}%`, icon: <FaCheckCircle />, color: '#10b981' },
            { id: 2, label: 'CGPA', value: studentMockStats.cgpa, icon: <FaUserGraduate />, color: '#3b82f6' },
            { id: 3, label: 'My Achievements', value: statsData.myAchievements, icon: <FaTrophy />, color: '#f59e0b' },
            { id: 4, label: 'Announcements', value: statsData.announcements, icon: <FaBullhorn />, color: '#6366f1' },
        ],
        Faculty: [
            { id: 1, label: 'Pending Approvals', value: statsData.pendingApprovals, icon: <FaExclamationCircle />, color: '#ef4444' }, // Real Data
            { id: 2, label: 'My Achievements', value: statsData.myAchievements, icon: <FaTrophy />, color: '#f59e0b' },
            { id: 3, label: 'Classes Today', value: '3', icon: <FaChalkboardTeacher />, color: '#3b82f6' }, // Mock
            { id: 4, label: 'Storage Used', value: formatBytes(statsData.storageUsed), icon: <FaDatabase />, color: '#6366f1' }
        ],
        HOD: [
            { id: 1, label: 'Actions Needed', value: statsData.pendingApprovals, icon: <FaExclamationCircle />, color: '#ef4444' }, // Real Data
            { id: 2, label: 'Faculty Count', value: statsData.facultyCount, icon: <FaChalkboardTeacher />, color: '#3b82f6' },
            { id: 3, label: 'Total Students', value: statsData.studentCount, icon: <FaUserGraduate />, color: '#10b981' },
            { id: 4, label: 'Dept Achievements', value: '45', icon: <FaTrophy />, color: '#f59e0b' } // Mock
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
                            statsData.recentAnnouncements.map((item, index) => {
                                const dateObj = new Date(item.date || new Date()); // Handle missing date
                                const month = dateObj.toLocaleString('default', { month: 'short' });
                                const day = dateObj.getDate();

                                return (
                                    <div key={index} className="activity-item">
                                        <div className="activity-date">
                                            <span>{month}</span>
                                            <strong>{day}</strong>
                                        </div>
                                        <div className="activity-content">
                                            <h4>{item.title}</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                                {item.sender || 'Admin'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '10px' }}>No recent announcements.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
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
                                <button className="action-btn" onClick={() => onDirectCategoryClick('Time Table')}>
                                    <FaClock /> Timetable
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