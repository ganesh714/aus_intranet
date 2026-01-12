import React, { useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('quick');

    // Determine if the user has permission to see the filter
    const isHigherOfficial = ['Dean', 'Asso.Dean', 'Officers', 'Admin'].includes(userRole);

    // HODs have conditional access, so we reserve space for them too
    const canAccessFilter = isHigherOfficial || userRole === 'HOD';

    // Toggle visibility based on logic
    const showFilter = isHigherOfficial || (userRole === 'HOD' && activeTab === 'department');

    const universityRoles = ['Dean', 'Asso.Dean', 'Officers', 'Admin'];
    const deptRoles = ['HOD', 'Faculty'];

    const universityAnnouncements = announcements.filter(ann => universityRoles.includes(ann.uploadedBy?.role));
    const deptAnnouncements = announcements.filter(ann => deptRoles.includes(ann.uploadedBy?.role));

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>Announcements</h2>
                {canAccessFilter && (
                    <div className="search-input-wrapper" style={{ width: '200px', visibility: showFilter ? 'visible' : 'hidden' }}>
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

            {/* Tabs */}
            <div className="ann-tabs">
                <button
                    className={`std-tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quick')}
                >
                    Quick reference
                </button>
                <button
                    className={`std-tab-btn ${activeTab === 'university' ? 'active' : ''}`}
                    onClick={() => setActiveTab('university')}
                >
                    University Announcements
                </button>
                {!isHigherOfficial && (
                    <button
                        className={`std-tab-btn ${activeTab === 'department' ? 'active' : ''}`}
                        onClick={() => setActiveTab('department')}
                    >
                        Department Announcements
                    </button>
                )}
            </div>

            <div className="general-announcements-wrapper">
                {activeTab === 'quick' && (
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
                                                <FaCalendarAlt /> {new Date(ann.uploadedAt).toLocaleDateString('en-GB')}
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
                                                    className="std-btn std-btn-sm"
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
                )}

                {activeTab === 'university' && (
                    universityAnnouncements.length > 0 ? (
                        <div className="tickers-group">
                            <div className="ticker-label-static" style={{ fontWeight: 'bold', marginBottom: '10px', color: '#F97316' }}>
                                <FaBullhorn /> University Updates:
                            </div>
                            <div className="recent-updates">
                                {universityAnnouncements.slice(0, 50).map((ann, index) => (
                                    <div key={index} className="announcement-ticker-container" style={{ marginBottom: '10px' }}>
                                        <div className="ticker-track-wrapper">
                                            <div className="ticker-track">
                                                <a href="#" className="ticker-link" onClick={(e) => { e.preventDefault(); onPdfClick(ann.fileId?.filePath); }}>
                                                    <span className="ticker-item">
                                                        {ann.title} - <span style={{ fontSize: '0.9em', opacity: 0.8 }}>{new Date(ann.uploadedAt).toLocaleDateString('en-GB')}</span>
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No university announcements found.</p>
                    )
                )}

                {activeTab === 'department' && !isHigherOfficial && (
                    deptAnnouncements.length > 0 ? (
                        <div className="tickers-group">
                            <div className="ticker-label-static" style={{ fontWeight: 'bold', marginBottom: '10px', color: '#10b981' }}>
                                <FaBullhorn /> Department Updates:
                            </div>
                            <div className="recent-updates" style={{ borderLeftColor: '#10b981' }}>
                                {deptAnnouncements.slice(0, 50).map((ann, index) => (
                                    <div key={index} className="announcement-ticker-container" style={{ marginBottom: '10px' }}>
                                        <div className="ticker-track-wrapper">
                                            <div className="ticker-track">
                                                <a href="#" className="ticker-link" onClick={(e) => { e.preventDefault(); onPdfClick(ann.fileId?.filePath); }}>
                                                    <span className="ticker-item" style={{ color: '#059669' }}>
                                                        {ann.title} - <span style={{ fontSize: '0.9em', opacity: 0.8 }}>{new Date(ann.uploadedAt).toLocaleDateString('en-GB')}</span>
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No department announcements found.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default AnnouncementFeed;