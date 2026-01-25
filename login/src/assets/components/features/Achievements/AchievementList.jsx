import React from 'react';
import { FaTrophy, FaCertificate, FaMedal, FaBriefcase, FaBook, FaChalkboardTeacher, FaRegLightbulb, FaFilePdf, FaUser, FaCheck, FaTimes, FaCalendarAlt, FaCheckSquare } from 'react-icons/fa';
import './Achievements.css';

const AchievementList = ({ achievements, onAddClick, showUser = false, showActions = false, onApprove, onReject, viewMode = 'grid' }) => {

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

    const renderDetails = (ach) => {
        const details = [];
        // Helper to push if value exists
        const addInfo = (label, value) => {
            if (value) details.push(<div key={label} className="card-detail-item"><span>{label}:</span> <strong>{value}</strong></div>);
        };

        // User Info (For HOD View)
        if (showUser && ach.userName) {
            details.push(
                <div key="user-info" className="card-detail-item user-info-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        <FaUser size={12} /> <strong>{ach.userName}</strong>
                    </span>
                    {/* User requested to remove role mention if it's obvious */}
                    {/* {ach.userRole && <span className="user-role-badge">{ach.userRole}</span>} */}
                </div>
            );
        }

        // Standard Fields
        addInfo("Issued By", ach.issuingBody || ach.organizer || ach.publisher || ach.provider);
        addInfo("Company", ach.companyName);
        addInfo("Role", ach.jobProfile || ach.role);
        addInfo("Package/Stipend", ach.package);
        addInfo("Rank", ach.rank);
        addInfo("Event", ach.eventName || ach.tournamentName);

        // Faculty Fields
        addInfo("Indexing", ach.indexing);
        addInfo("Volume/Issue", ach.volume);
        addInfo("ISBN/ISSN", ach.isbn);
        addInfo("Students Trained", ach.studentsTrained);
        addInfo("Project", ach.projectName);

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
        // If it's already a full date string, return it. If it's partial, adding logic if needed.
        return dateStr;
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
                        <div key={ach.id || ach._id} className="achievement-card">
                            <div className="card-content-wrapper">
                                <div className="card-header-row">
                                    <div className="mat-icon-wrapper">
                                        {getIcon(ach.type)}
                                    </div>
                                    <div className="card-header-text">
                                        <div className="card-title" title={ach.title || ach.eventName}>
                                            {ach.title || ach.certificationName || ach.eventName || ach.companyName || ach.projectName || ach.courseName}
                                        </div>
                                        <div className="card-type-label">
                                            {ach.type}
                                        </div>
                                    </div>
                                    {/* Status Badge Removed from Header as per request */}
                                </div>

                                <div className="card-details">
                                    {/* Date Row */}
                                    <div className="card-detail-item date-row">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FaCalendarAlt size={12} style={{ color: '#94a3b8' }} />
                                            {formatDate(ach.date)}
                                        </span>
                                    </div>

                                    {renderDetails(ach)}

                                    {/* Proof Link */}
                                    {ach.proof && (
                                        <div className="card-detail-item proof-row">
                                            <FaFilePdf />
                                            <span>Proof: {ach.proof}</span>
                                        </div>
                                    )}

                                    {/* Approved By Footer */}
                                    {ach.status === 'Approved' && ach.approvedBy && (
                                        <div className="approval-footer">
                                            <FaCheckSquare size={12} /> Approved by {ach.approvedBy}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status at Bottom Right (New Requirement) */}
                            {/* We place it in a footer div to ensure positioning */}
                            <div className="card-status-footer">
                                <span className={`status-badge-inline ${getStatusColor(ach.status)}`}>
                                    {ach.status || 'Pending'}
                                </span>
                            </div>


                            {/* Actions Footer (For HOD/Approvals) */}
                            {showActions && (
                                <div className="card-actions-footer">
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
        </>
    );
};

export default AchievementList;
