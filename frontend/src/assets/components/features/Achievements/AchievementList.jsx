import React, { useState } from 'react';
import { FaTrophy, FaCertificate, FaMedal, FaBriefcase, FaBook, FaChalkboardTeacher, FaRegLightbulb, FaFilePdf, FaUser, FaCheck, FaTimes, FaCalendarAlt, FaCheckSquare } from 'react-icons/fa';
import './Achievements.css';

const AchievementList = ({ achievements, onAddClick, showUser = false, showActions = false, onApprove, onReject, viewMode = 'grid', compact = false }) => {
    const [selectedAch, setSelectedAch] = useState(null);

    const getIcon = (type) => {
        switch (type) {
            case 'Technical Certification':
            case 'Certifications & Online Courses':
                return <FaCertificate />;
            case 'Competitions & Awards':
                return <FaTrophy />;
            case 'Placements & Internships':
                return <FaBriefcase />;
            case 'Research Publications':
            case 'Books & Literature':
                return <FaBook />;
            case 'Innovation & Leadership':
            case 'Research Consultancy':
            case 'Intellectual Property':
                return <FaRegLightbulb />;
            case 'Mentorship & Student Training':
            case 'Conference Presentations':
            case 'Professional Development':
                return <FaChalkboardTeacher />;
            case 'Sports & Cultural Events':
                return <FaMedal />;
            case 'Others':
                return <FaTrophy />;
            default:
                return <FaTrophy />;
        }
    };

    // Helper to check if a value is valid for display (not null, undefined, or "undefined" string)
    const isValid = (val) => {
        if (!val) return false;
        const s = String(val).trim().toLowerCase();
        return s !== 'undefined' && s !== 'null' && s !== '';
    };

    const renderDetails = (ach) => {
        const details = [];
        const hiddenKeys = [
            '_id', 'id', 'userId', 'userRole', 'userName', 'dept', '__v',
            'proof', 'proofFileId', 'status', 'approvedBy', 'approverId', 'approverRole',
            'type', 'title', 'description', 'date', 'createdAt', 'updatedAt'
        ];

        // Format key to meaningful label (e.g., certificationName -> Certification Name)
        const formatLabel = (key) => {
            return key
                .replace(/([A-Z])/g, ' $1') // insert space before capital
                .replace(/^./, str => str.toUpperCase()) // uppercase first char
                .trim();
        };

        // User Info (For HOD View) - MOVED OUTSIDE LOOP to handle placement in Compact Mode properly.
        // if (showUser && ach.userName) { ... }

        // Dynamic rendering of all other fields
        Object.entries(ach).forEach(([key, value]) => {
            if (!hiddenKeys.includes(key) && isValid(value)) {
                details.push(
                    <div key={key} className="card-detail-item">
                        <span>{formatLabel(key)}:</span>
                        <strong>{value}</strong>
                    </div>
                );
            }
        });

        return details;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'status-approved';
            case 'Rejected': return 'status-rejected';
            case 'Pending': return 'status-pending';
            default: return 'status-pending';
        }
    };

    /* --- Formatted Date Helper --- */
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            return dateStr;
        } catch (e) { return dateStr; }
    };

    // Helper to get a valid display title based on Type
    const getDisplayTitle = (ach) => {
        // PER USER REQUEST: Prioritize the main 'title' field which is user-entered.
        if (isValid(ach.title)) return ach.title;

        let primaryField = null;

        // Fallback: Map Type to specific fields if title is missing
        switch (ach.type) {
            case 'Technical Certification':
            case 'Certifications & Online Courses':
                primaryField = ach.certificationName;
                break;
            case 'Placements & Internships':
                primaryField = ach.companyName;
                break;
            case 'Competitions & Awards':
            case 'Sports & Cultural Events':
                primaryField = ach.eventName;
                break;
            case 'Innovation & Leadership':
                primaryField = ach.activityName;
                break;
            case 'Research Consultancy':
                primaryField = ach.projectName;
                break;
            case 'Mentorship & Student Training':
                primaryField = ach.programName;
                break;
            default:
                primaryField = null;
        }

        if (isValid(primaryField)) return primaryField;

        // Fallback checks if primary field was empty
        const candidates = [
            ach.certificationName, ach.eventName,
            ach.companyName, ach.productName, ach.activityName, ach.projectName,
            ach.programName, ach.courseName, ach.jobProfile, ach.role,
            ach.organizer, ach.publisher
        ];

        const validTitle = candidates.find(c => isValid(c));
        if (validTitle) return validTitle;

        return `${ach.type || 'Achievement'} (Untitled)`;
    };

    return (
        <>
            {achievements.length === 0 ? (
                <div className="empty-state">
                    <h3>No records found</h3>
                    {onAddClick && <p>Click the "Upload New" tab to showcase your accomplishments.</p>}
                </div>
            ) : (
                <div className={viewMode === 'list' ? "achievements-list-layout" : "achievements-grid"}>
                    {achievements.map((ach) => (
                        <div
                            key={ach.id || ach._id}
                            className="achievement-card"
                            onClick={() => setSelectedAch(ach)}
                        >
                            <div className="card-content-wrapper">
                                <div className="card-header-row">
                                    <div className="mat-icon-wrapper">
                                        {getIcon(ach.type)}
                                    </div>
                                    <div className="card-header-text">
                                        <div className="card-title" title={getDisplayTitle(ach)}>
                                            {getDisplayTitle(ach)}
                                        </div>
                                        <div className="card-type-label">
                                            {ach.type}
                                        </div>
                                        
                                        {/* User Byline (Left aligned, clean) */}
                                        {showUser && ach.userId && (
                                            <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUser size={10} style={{ color: '#94a3b8' }} /> 
                                                <span style={{ fontWeight: '500', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{ach.userId}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-header-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        {/* Status Badge */}
                                        <div className={`status-badge-inline ${getStatusColor(ach.status)}`}>
                                            {ach.status || 'Pending'}
                                        </div>

                                        {/* Approver Name (Green, below status) */}
                                        {ach.status === 'Approved' && ach.approvedBy && (
                                            <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaCheck size={8} /> {ach.approvedBy} <span style={{ fontWeight: '400', opacity: 0.8 }}>({ach.approverRole})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Details Section - ONLY render if NOT compact to avoid empty space/border */}
                                {!compact && (
                                    <div className="card-details">
                                        <div className="card-detail-item date-row">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FaCalendarAlt size={12} style={{ color: '#94a3b8' }} />
                                                {formatDate(ach.date)}
                                            </span>
                                        </div>

                                        {renderDetails(ach).slice(0, 3)}
                                        {renderDetails(ach).length > 3 && <span style={{ fontSize: '11px', color: '#94a3b8' }}>+ More details...</span>}

                                        {ach.status === 'Approved' && ach.approvedBy && (
                                            <div className="approval-footer">
                                                <FaCheckSquare size={12} /> Approved by {ach.approvedBy}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer (For HOD/Approvals) */}
                            {showActions && (
                                <div className="card-actions-footer" onClick={(e) => e.stopPropagation()}>
                                    {ach.status !== 'Rejected' && (
                                        <button className="action-btn-mini reject" onClick={() => onReject(ach._id || ach.id)} title="Reject">
                                            <FaTimes /> Reject
                                        </button>
                                    )}
                                    {ach.status !== 'Approved' && (
                                        <button className="action-btn-mini approve" onClick={() => onApprove(ach._id || ach.id)} title="Approve">
                                            <FaCheck /> Approve
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* DETAILS MODAL POPUP */}
            {selectedAch && (
                <div className="modal-overlay" onClick={() => setSelectedAch(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Achievement Details</h3>
                            <button className="close-btn" onClick={() => setSelectedAch(null)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-status-bar">
                                <span className={`status-badge-inline ${getStatusColor(selectedAch.status)}`}>
                                    {selectedAch.status || 'Pending'}
                                </span>
                                <span className="modal-date">{formatDate(selectedAch.date)}</span>
                            </div>

                            <div className="modal-main-info">
                                <h4>{getDisplayTitle(selectedAch)}</h4>
                                <p className="modal-type">{selectedAch.type}</p>
                                {showUser && selectedAch.userName && (
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                        marginTop: '8px', background: '#f1f5f9', padding: '4px 10px', 
                                        borderRadius: '20px', fontSize: '12px', color: '#475569', fontWeight: 'bold' 
                                    }}>
                                        <FaUser size={10} /> {selectedAch.userName}
                                    </div>
                                )}
                            </div>

                            <div className="modal-details-grid">
                                {renderDetails(selectedAch)}
                            </div>

                            {isValid(selectedAch.description) && (
                                <div className="modal-description">
                                    <label>Description:</label>
                                    <p>{selectedAch.description}</p>
                                </div>
                            )}

                            {isValid(selectedAch.proof) && (
                                <div className="modal-proof">
                                    <label>Proof Document:</label>
                                    <a
                                        href={`${import.meta.env.VITE_BACKEND_URL}/uploads/${selectedAch.proof}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="proof-link"
                                    >
                                        <FaFilePdf /> View Document ({selectedAch.proof})
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AchievementList;
