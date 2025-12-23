import React from 'react';
import './Sidebar.css';
import { MdDashboard, MdCampaign } from 'react-icons/md';
import { FaBullhorn, FaFolder, FaChevronRight, FaFilePdf, FaBook, FaClock } from 'react-icons/fa';

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
    onDirectCategoryClick // <--- New Prop for direct clicking main categories
}) => {
    
    // Helper to check if a category should be a direct link for Students
    const isStudentDirectLink = (catName) => {
        return userRole === 'Student' && ['Teaching Material', 'Time Table'].includes(catName);
    };

    const getIcon = (catName) => {
        if(catName === 'Teaching Material') return <FaBook className="cat-icon"/>;
        if(catName === 'Time Table') return <FaClock className="cat-icon"/>;
        return <FaFolder className="cat-icon"/>;
    }

    return (
        <div className="sidebar">
            <h3 className="sidebar-header">Menu</h3>
            <div className="category-list">
                {/* Dashboard */}
                <div className={`category-item ${showContentP ? "expanded" : ""}`}>
                    <div className="category-header" onClick={onDashboardClick}>
                        <span className="cat-name">
                            <MdDashboard className="cat-icon"/> Dashboard
                        </span>
                    </div>
                </div>

                {/* My Data (Non-Students) */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${type === 'Personal Data' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onPersonalDataClick}>
                            <span className="cat-name">
                                <FaFolder className="cat-icon"/> My Data
                            </span>
                        </div>
                    </div>
                )}

                {/* Send Announcements (Non-Students) */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${showSendAnnounce ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onSendAnnounceClick}>
                            <span className="cat-name">
                                <MdCampaign className="cat-icon"/> Send Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* View Announcements (Students) */}
                {userRole === 'Student' && (
                    <div className={`category-item ${type === 'Announcements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onViewAnnouncementsClick}>
                            <span className="cat-name">
                                <FaBullhorn className="cat-icon"/> Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* Dynamic Categories */}
                {pdfLinks.map((category, index) => {
                    // Check if this is a direct link for students
                    if (isStudentDirectLink(category.category)) {
                        return (
                            <div key={index} className={`category-item ${activeCategory === category.category ? "expanded" : ""}`}>
                                <div className="category-header" onClick={() => onDirectCategoryClick(category.category)}>
                                    <span className="cat-name">{getIcon(category.category)} {category.category}</span>
                                    {/* No Chevron for direct links */}
                                </div>
                            </div>
                        );
                    }

                    // Default Accordion Behavior
                    return (
                        <div key={index} className={`category-item ${activeCategory === category.category ? "expanded" : ""}`}>
                            <div className="category-header" onClick={() => onToggleCategory(category.category)}>
                                <span className="cat-name"><FaFolder className="cat-icon"/> {category.category}</span>
                                <FaChevronRight className={`chevron ${activeCategory === category.category ? "rotate" : ""}`}/>
                            </div>
                            
                            <div className="subcategory-list">
                                {[...new Set(category.items.map(item => item.subcategory))]
                                    .filter(subCat => !(
                                        ["Dept.Equipment", "Teaching Material", "Staff Presentations", "Time Table"].includes(category.category) && subCat === "Announcements"
                                    ))
                                    .map((subCat) => (
                                        <button key={subCat} className="subcat-btn" onClick={() => onSubCategoryClick(category.items, subCat, category.category)}>
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