import React from 'react';
import './Sidebar.css';
import { MdDashboard, MdCampaign } from 'react-icons/md';

import { FaBullhorn, FaFolder, FaChevronRight, FaFilePdf, FaBook, FaClock, FaTrophy } from 'react-icons/fa';

const Sidebar = ({
    userRole,
    pdfLinks,
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

                {/* [NEW] My Achievements (Student, Faculty, HOD) */}
                {(userRole === 'Student' || userRole === 'Faculty' || userRole === 'HOD') && (
                    <div className={`category-item ${type === 'Achievements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onAchievementsClick}>
                            <span className="cat-name">
                                <FaTrophy className="cat-icon" /> My Achievements
                            </span>
                        </div>
                    </div>
                )}

                {/* [NEW] HOD/Faculty Department Achievements */}
                {(userRole === 'HOD' || (userRole === 'Faculty' && (() => {
                    // Check if current faculty has ANY permission
                    try {
                        const storedPerms = localStorage.getItem('achievement_permissions');
                        if (!storedPerms) return false;
                        const perms = JSON.parse(storedPerms);
                        // User ID might be passed as a prop, but here we don't have it in props yet.
                        // Sidebar is usually used where userId is available in parent.
                        // Let's assume we can read it from session or we need to pass it.
                        // Wait, Sidebar doesn't receive userId. We must rely on session or pass it.
                        // Checking main Content wrapper, userId is usually available.
                        // For now, let's look at sessionStorage 'userId' if available or rely on prop which we need to add.
                        const sUserId = sessionStorage.getItem('userId');
                        if (!sUserId || !perms[sUserId]) return false;
                        return perms[sUserId].student || perms[sUserId].faculty;
                    } catch (e) { return false; }
                })())) && (
                        <div className={`category-item ${type === 'HODAchievements' ? "expanded" : ""}`}>
                            <div className="category-header" onClick={() => onDirectCategoryClick('HODAchievements')}>
                                <span className="cat-name">
                                    <FaTrophy className="cat-icon" style={{ color: '#ea580c' }} /> Achievements (Dept)
                                </span>
                            </div>
                        </div>
                    )}

                {/* Send Announcements (Non-Students) */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${showSendAnnounce ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onSendAnnounceClick}>
                            <span className="cat-name">
                                <MdCampaign className="cat-icon" /> Send Announcements
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

                {/* Dynamic Categories */}
                {pdfLinks.map((category, index) => {
                    // NEW: Filter out specific categories for Admin
                    if (userRole === 'Admin' && ['Faculty related', "HOD's related", "Dean's related"].includes(category.category)) {
                        return null;
                    }

                    // NEW: Filter out "Student Related" for non-Faculty/HOD
                    const isFacultyOrHod = ['Faculty', 'HOD'].includes(userRole);
                    if (category.category === 'Student Related' && !isFacultyOrHod) {
                        return null;
                    }

                    // NEW: Remove "HOD's related" for HOD
                    if (userRole === 'HOD' && category.category === "HOD's related") {
                        return null;
                    }

                    // NEW: Remove "Staff Presentations" for Faculty and HOD (as requested)
                    if (category.category === 'Staff Presentations' && isFacultyOrHod) {
                        return null;
                    }

                    // NEW: Remove "Vice Chancellor" category
                    if (category.category === 'Vice Chancellor') {
                        return null;
                    }

                    // NEW: Remove "Dept.Equipment" for Faculty and HOD
                    if ((userRole === 'Faculty' || userRole === 'HOD') && category.category === 'Dept.Equipment') {
                        return null;
                    }

                    // NEW: Remove "Student Related" for Faculty and HOD
                    if ((userRole === 'Faculty' || userRole === 'HOD') && category.category === 'Student Related') {
                        return null;
                    }

                    // Check if this is a direct link (Students or Dept.Equipment)
                    const isDirectLink = (catName) => {
                        if (['Material', 'Time Table'].includes(catName)) return true; // Direct link for everyone who has it
                        if (catName === 'Dept.Equipment' || catName === 'Faculty related') return true;
                        return false;
                    };

                    if (isDirectLink(category.category)) {
                        return (
                            <div key={index} className={`category-item ${activeCategory === category.category ? "expanded" : ""}`}>
                                <div className="category-header" onClick={() => onDirectCategoryClick(category.category)}>
                                    <span className="cat-name">
                                        {getIcon(category.category)}
                                        {category.category === 'Faculty related' ? 'Announcements' :
                                            category.category === 'Material' ? 'Shared Documents' :
                                                category.category}
                                    </span>
                                    {/* No Chevron for direct links */}
                                </div>
                            </div>
                        );
                    }

                    // Default Accordion Behavior
                    return (
                        <div key={index} className={`category-item ${activeCategory === category.category ? "expanded" : ""}`}>
                            <div className="category-header" onClick={() => onToggleCategory(category.category)}>
                                <span className="cat-name"><FaFolder className="cat-icon" /> {category.category}</span>
                                <FaChevronRight className={`chevron ${activeCategory === category.category ? "rotate" : ""}`} />
                            </div>

                            <div className="subcategory-list">
                                {[...new Set(category.items.map(item => item.subcategory))]
                                    .filter(subCat => {
                                        // Existing filter: Remove Announcements from specific categories
                                        // UPDATED: Added "University related" to the exclusion list
                                        if (["Dept.Equipment", "Teaching Material", "Staff Presentations", "Time Table", "University related"].includes(category.category) && subCat === "Announcements") return false;

                                        // NEW: Remove "Documents" from "Student Related" for Faculty and HOD
                                        if (category.category === 'Student Related' && subCat === 'Documents' && isFacultyOrHod) return false;

                                        return true;
                                    })
                                    .map((subCat) => (
                                        <button key={subCat} className="std-tab-btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none' }} onClick={() => onSubCategoryClick(category.items, subCat, category.category)}>
                                            {subCat === 'Announcements' ? <FaBullhorn /> : <FaFilePdf />} {subCat}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;