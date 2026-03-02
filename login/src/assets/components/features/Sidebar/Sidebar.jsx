import React from 'react';
import './Sidebar.css';
import { MdDashboard, MdCampaign } from 'react-icons/md';

import { FaBullhorn, FaFolder, FaChevronRight, FaFilePdf, FaBook, FaClock, FaTrophy, FaChalkboardTeacher } from 'react-icons/fa';

const Sidebar = ({
    userRole,
    activeCategory,
    showContentP,
    showSendAnnounce,
    type,
    onDashboardClick,
    onSendAnnounceClick,
    onViewAnnouncementsClick,
    onPersonalDataClick,
    onToggleCategory,
    onSubCategoryClick,
    onDirectCategoryClick, // <--- New Prop for direct clicking main categories
    onAchievementsClick // [NEW] Handler for achievements
}) => {

    // Helper to check if a category should be a direct link for Students
    const isStudentDirectLink = (catName) => {
        return userRole === 'Student' && ['Material', 'Time Table'].includes(catName);
    };

    const getIcon = (catName) => {
        if (catName === 'Material' || catName === 'Teaching Material') return <FaBook className="cat-icon" />;
        if (catName === 'Time Table') return <FaClock className="cat-icon" />;
        if (catName === 'Faculty related') return <FaBullhorn className="cat-icon" />;
        return <FaFolder className="cat-icon" />;
    }

    return (
        <div className="sidebar">

            <div className="category-list">
                {/* Dashboard */}
                <div className={`category-item ${showContentP ? "expanded" : ""}`}>
                    <div className="category-header" onClick={onDashboardClick}>
                        <span className="cat-name">
                            <MdDashboard className="cat-icon" /> Dashboard
                        </span>
                    </div>
                </div>

                {/* My Data (Non-Admin) */}
                {userRole !== 'Admin' && (
                    <div className={`category-item ${type === 'Personal Data' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onPersonalDataClick}>
                            <span className="cat-name">
                                <FaFolder className="cat-icon" /> My Data
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] My Achievements (Student, Faculty, HOD, Dean, Asso.Dean) */}
                {(['Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Officers'].includes(userRole)) && (
                    <div className={`category-item ${type === 'Achievements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onAchievementsClick}>
                            <span className="cat-name">
                                <FaTrophy className="cat-icon" /> My Achievements
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] HOD/Faculty/Dean Department Achievements */}
                {/* [UPDATED] Visible to all Faculty, no permission check here */}
                {(['Dean', 'Asso.Dean', 'HOD', 'Faculty'].includes(userRole)) && (
                    <div className={`category-item ${type === 'HODAchievements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('HODAchievements')}>
                            <span className="cat-name">
                                <FaTrophy className="cat-icon" style={{ color: '#ea580c' }} /> Achievements (Dept)
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] Announcements (Faculty Related) - Moved here to be before Send Announcements */}
                {/* Deans should see this if HODs see it (BUT NOT Associate Deans as per request - REVERTED based on user feedback) */}
                {(['Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Officers'].includes(userRole)) && (
                    <div className={`category-item ${activeCategory === 'Faculty related' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('Faculty related')}>
                            <span className="cat-name">
                                {getIcon('Faculty related')} Announcements
                            </span>
                        </div>
                    </div>
                )}



                {/* Send Announcements (Non-Students)  */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${showSendAnnounce ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onSendAnnounceClick}>
                            <span className="cat-name">
                                <MdCampaign className="cat-icon" /> Send Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] Shared Documents (For All Users except Admin) */}
                {(['Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Officers'].includes(userRole)) && (
                    <div className={`category-item ${activeCategory === 'Material' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('Material')}>
                            <span className="cat-name">
                                <FaBook className="cat-icon" /> Shared Documents
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] Time Table (Excluded for Deans) */}
                {(['Student', 'Faculty', 'HOD', 'Officers'].includes(userRole)) && (
                    <div className={`category-item ${activeCategory === 'Time Table' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('Time Table')}>
                            <span className="cat-name">
                                <FaClock className="cat-icon" /> Time Table
                            </span>
                        </div>
                    </div>
                )}

                {/* View Announcements (Students) */}
                {userRole === 'Student' && (
                    <div className={`category-item ${type === 'Announcements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onViewAnnouncementsClick}>
                            <span className="cat-name">
                                <FaBullhorn className="cat-icon" /> Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* 1. Faculty Link (Visible only if granted access) */}
                {userRole === 'Faculty' && JSON.parse(sessionStorage.getItem('permissions') || '{}').canManageWorkshops && (
                    <div className={`category-item ${type === 'Workshops' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('Workshops')}>
                            <span className="cat-name">
                                <FaChalkboardTeacher className="cat-icon" /> Workshops conducted
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. HOD Link (Always Visible for HOD, Dean, Associate Dean) */}
                {['HOD', 'Dean', 'Asso.Dean'].includes(userRole) && (
                    <div className={`category-item ${type === 'HODWorkshops' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={() => onDirectCategoryClick('HODWorkshops')}>
                            <span className="cat-name">
                                <FaChalkboardTeacher className="cat-icon" /> Workshops (Dept)
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] Manage SubRoles (Admin Only) */}
                {userRole === 'Admin' && (
                    <div className="category-item">
                        <div className="category-header" onClick={() => onDirectCategoryClick('Manage SubRoles')}>
                            <span className="cat-name">
                                <FaBook className="cat-icon" /> Manage Depts
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Developers Link (Bottom) */}
            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <a
                    href="/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    Developers
                </a>
            </div>
        </div>
    );
};

export default Sidebar;