import React from 'react';
import './Announcements.css';
import { FaBullhorn, FaCalendarAlt, FaUserCircle, FaFilePdf } from 'react-icons/fa';

const AnnouncementFeed = ({ 
    announcements, 
    deptFilter, 
    setDeptFilter, 
    userRole, 
    subRolesMapping, 
    onPdfClick 
}) => {
    // Determine if the user has permission to see the filter
    const showFilter = ['HOD', 'Dean', 'Asso.Dean', 'Officers', 'Admin'].includes(userRole);

    return (
        <div className="results-container">
            <div className="search-header">
                <h2>Announcements</h2>
                {showFilter && (
                    <div className="search-input-wrapper" style={{ width: '200px' }}>
                        <select 
                            className="modern-search" 
                            style={{ padding: '10px', paddingLeft: '15px' }}
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {subRolesMapping['Faculty']?.filter(r => r !== 'All').map((dept, i) => (
                                <option key={i} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="general-announcements-wrapper">
                {announcements.length > 0 && (
                    <div className="tickers-group">
                        <div className="ticker-label-static" style={{fontWeight:'bold', marginBottom:'10px', color:'#F97316'}}>
                            <FaBullhorn /> Recent Updates:
                        </div>
                        {announcements.slice(0, 5).map((ann, index) => (
                            <div key={index} className="announcement-ticker-container" style={{ marginBottom: '10px' }}>
                                <div className="ticker-track-wrapper">
                                    <div className="ticker-track">
                                        <span className="ticker-item">
                                            {ann.title} - <span style={{fontSize:'0.9em', opacity:0.8}}>{new Date(ann.uploadedAt).toLocaleDateString()}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="all-announcements-grid">
                    {announcements.length === 0 ? (
                        <p className="no-data">No announcements found matching filter.</p>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann._id} className="detail-card">
                                <div className="dc-left">
                                    <div className="dc-icon"><FaBullhorn /></div>
                                </div>
                                <div className="dc-content">
                                    <div className="dc-header">
                                        <h3 className="dc-title">{ann.title}</h3>
                                        <span className="dc-date">
                                            <FaCalendarAlt /> {new Date(ann.uploadedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="dc-description">{ann.description}</p>
                                    <div className="dc-footer">
                                        <div className="dc-author">
                                            <FaUserCircle /> {ann.uploadedBy?.username} 
                                            <span className="dc-role-badge">{ann.uploadedBy?.role}</span>
                                        </div>
                                        {ann.fileId?.filePath && (
                                            <button
                                                className="dc-pdf-btn"
                                                onClick={(e) => onPdfClick(ann.fileId.filePath, e)}
                                            >
                                                <FaFilePdf /> View PDF
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementFeed;