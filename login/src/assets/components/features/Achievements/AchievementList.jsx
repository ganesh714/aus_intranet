import React from 'react';
import { FaTrophy, FaCertificate, FaMedal, FaBriefcase, FaBook, FaChalkboardTeacher, FaRegLightbulb, FaFilePdf } from 'react-icons/fa';
import './Achievements.css';

const AchievementList = ({ achievements, onAddClick }) => {

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

        // Student Fields
        addInfo("Issued By", ach.issuingBody);
        addInfo("Issued By", ach.issuingBody);

        // Custom Row for Date + Approved By (Parallel)
        if (ach.date) {
            details.push(
                <div key="date-approved" className="card-detail-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Date: <strong>{ach.date}</strong></span>
                    {ach.status === 'Approved' && ach.approvedBy && (
                        <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>
                            Approved By: {ach.approvedBy}
                        </span>
                    )}
                </div>
            );
        }

        addInfo("Company", ach.companyName);
        addInfo("Role", ach.jobProfile || ach.role);
        addInfo("Package/Stipend", ach.package);
        addInfo("Rank", ach.rank);
        addInfo("Event", ach.eventName || ach.tournamentName);

        // Faculty Fields
        addInfo("Indexing", ach.indexing);
        addInfo("Volume/Issue", ach.volume);
        addInfo("ISBN/ISSN", ach.isbn);
        addInfo("Publisher", ach.publisher);
        addInfo("Students Trained", ach.studentsTrained);
        addInfo("Status", ach.status);
        addInfo("Project", ach.projectName);

        return details;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'status-approved';
            case 'Rejected': return 'status-rejected';
            case 'Pending': return 'status-pending';
            default: return '';
        }
    };

    return (
        <>
            {achievements.length === 0 ? (
                <div className="empty-state">
                    <h3>No achievements added yet</h3>
                    <p>Click the "Upload New" tab to showcase your accomplishments.</p>
                </div>
            ) : (
                <div className="achievements-grid">
                    {achievements.map((ach) => (
                        <div key={ach.id} className="achievement-card">
                            <div className="mat-icon-wrapper">
                                {getIcon(ach.type)}
                            </div>

                            <div className="card-title">
                                {ach.title || ach.certificationName || ach.eventName || ach.companyName || ach.projectName || ach.courseName}
                            </div>

                            {/* Type as Subject Line - Matches Materials */}
                            <div className="card-subtitle" style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>
                                {ach.type}
                            </div>

                            {/* Issuing Body / Subtitle */}
                            <div className="card-subtitle" style={{ fontSize: '13px', marginBottom: '15px' }}>
                                {ach.issuingBody || ach.organizer || ach.publisher || ach.provider}
                            </div>

                            <div className="card-details">
                                {renderDetails(ach)}
                                {ach.proof && (
                                    <div className="card-detail-item" style={{ marginTop: '10px', color: '#dc2626', fontWeight: '500' }}>
                                        <FaFilePdf style={{ marginRight: '6px' }} />
                                        {ach.proof}
                                    </div>
                                )}
                            </div>

                            {/* Footer for Status Badge - Prevents overlap */}
                            <div className="card-meta" style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                                {ach.status && (
                                    <span className={`status-badge-inline ${getStatusColor(ach.status)}`}>
                                        {ach.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default AchievementList;
