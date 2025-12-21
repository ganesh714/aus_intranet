import React from 'react';
import './Sidebar.css';
import { MdDashboard, MdCampaign } from 'react-icons/md';
import { FaBullhorn, FaFolder, FaChevronRight, FaFilePdf } from 'react-icons/fa';

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
    onSubCategoryClick 
}) => {
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
                {/* My Data (Personal Data) - Not for Students */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${type === 'Personal Data' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onPersonalDataClick}>
                            <span className="cat-name">
                                <FaFolder className="cat-icon"/> My Data
                            </span>
                        </div>
                    </div>
                )}

                {/* Send Announcements (Not for Students) */}
                {userRole !== 'Student' && (
                    <div className={`category-item ${showSendAnnounce ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onSendAnnounceClick}>
                            <span className="cat-name">
                                <MdCampaign className="cat-icon"/> Send Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* View Announcements (For Students) */}
                {userRole === 'Student' && (
                    <div className={`category-item ${type === 'Announcements' ? "expanded" : ""}`}>
                        <div className="category-header" onClick={onViewAnnouncementsClick}>
                            <span className="cat-name">
                                <FaBullhorn className="cat-icon"/> Announcements
                            </span>
                        </div>
                    </div>
                )}

                {/* Document Categories */}
                {pdfLinks.map((category, index) => (
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
                ))}
            </div>
        </div>
    );
};

export default Sidebar;