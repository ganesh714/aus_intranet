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
        addInfo("Date", ach.date);
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
                            <span className="card-type-badge">{ach.type}</span>
                            <div className="card-title">
                                {ach.title || ach.certificationName || ach.eventName || ach.companyName || ach.projectName || ach.courseName}
                            </div>
                            <div className="card-subtitle">
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
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default AchievementList;
