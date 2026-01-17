import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import './Achievements.css';

const AchievementForm = ({ userRole, userId, onCancel, onSave }) => {
    // Determine form categories based on Role
    const isStudent = userRole === 'Student';

    const studentCategories = [
        "Technical Certification",
        "Placements & Internships",
        "Competitions & Awards",
        "Sports & Cultural Events",
        "Innovation & Leadership"
    ];

    const facultyCategories = [
        "Research Publications",
        "Conference Presentations",
        "Intellectual Property",
        "Certifications & Online Courses",
        "Professional Development",
        "Research Consultancy",
        "Mentorship & Student Training",
        "Books & Literature"
    ];

    const categories = isStudent ? studentCategories : facultyCategories;

    const [formData, setFormData] = useState({
        type: categories[0],
        // Common
        title: '',
        date: '',
        description: '',
        proof: '', // [NEW] Stores fake filename
        // Dynamic fields will be added to state
    });

    // Reset specific fields when type changes
    const handleTypeChange = (e) => {
        setFormData({
            type: e.target.value,
            date: '', // keep date?
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Construct the final object
        const newAchievement = {
            id: Date.now(), // simple ID
            userId,
            userRole,
            ...formData,
            createdAt: new Date().toISOString()
        };
        onSave(newAchievement);
    };

    // [NEW] Handle File Selection (Fake Upload)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, proof: file.name }));
        }
    };

    // --- Dynamic Field Rendering ---
    const renderFields = () => {
        const type = formData.type;

        // --- STUDENT FORMS ---
        if (type === "Technical Certification" || type === "Certifications & Online Courses") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">Certification/Course Name</label>
                        <input name="certificationName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Issuing Body / Provider</label>
                        <input name="issuingBody" className="std-input" required onChange={handleChange} placeholder="e.g. Microsoft, Coursera" />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Date of Completion</label>
                        <input name="date" type="date" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">{type === "Technical Certification" ? "Certificate ID" : "Score / Status"}</label>
                        <input name={type === "Technical Certification" ? "certificateId" : "score"} className="std-input" onChange={handleChange} />
                    </div>
                    {type === "Certifications & Online Courses" && (
                        <div className="std-form-group">
                            <label className="std-label">Duration</label>
                            <input name="duration" className="std-input" onChange={handleChange} placeholder="e.g. 8 Weeks" />
                        </div>
                    )}
                </>
            );
        }

        if (type === "Placements & Internships") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">Company Name</label>
                        <input name="companyName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Job Profile / Role</label>
                        <input name="jobProfile" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Package (LPA) / Stipend</label>
                        <input name="package" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Location</label>
                        <input name="location" className="std-input" onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Offer Type</label>
                        <select name="offerType" className="std-select" onChange={handleChange}>
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                            <option value="PPO">PPO</option>
                        </select>
                    </div>
                </>
            );
        }

        if (type === "Competitions & Awards" || type === "Sports & Cultural Events") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">Event / Tournament Name</label>
                        <input name="eventName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Organizing Institution</label>
                        <input name="organizer" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Rank / Position / Status</label>
                        <input name="rank" className="std-input" required onChange={handleChange} placeholder="e.g. 1st Prize, Finalist" />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Date</label>
                        <input name="date" type="date" className="std-input" onChange={handleChange} />
                    </div>
                </>
            );
        }

        if (type === "Innovation & Leadership") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">Activity Name</label>
                        <input name="activityName" className="std-input" required onChange={handleChange} placeholder="e.g. Smart India Hackathon" />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Role</label>
                        <input name="role" className="std-input" required onChange={handleChange} placeholder="e.g. Team Lead" />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Type</label>
                        <select name="activityType" className="std-select" onChange={handleChange}>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Startup">Startup Expo</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Club Activity">Club Activity</option>
                        </select>
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Organizer</label>
                        <input name="organizer" className="std-input" onChange={handleChange} />
                    </div>
                </>
            );
        }

        // --- FACULTY FORMS ---
        if (type === "Research Publications") {
            return (
                <>
                    <div className="std-form-group full-width">
                        <label className="std-label">Paper Title</label>
                        <input name="title" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Journal Name</label>
                        <input name="journalName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Indexing</label>
                        <select name="indexing" className="std-select" onChange={handleChange}>
                            <option value="Scopus">Scopus</option>
                            <option value="SCI">SCI</option>
                            <option value="UGC Care">UGC Care</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Volume / Issue</label>
                        <input name="volume" className="std-input" onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">ISSN</label>
                        <input name="isbn" className="std-input" onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Publication Date</label>
                        <input name="date" type="date" className="std-input" required onChange={handleChange} />
                    </div>
                </>
            );
        }

        if (type === "Conference Presentations") {
            return (
                <>
                    <div className="std-form-group full-width">
                        <label className="std-label">Presentation Title</label>
                        <input name="title" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Conference Name</label>
                        <input name="conferenceName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Organizer</label>
                        <input name="organizer" className="std-input" onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Location</label>
                        <input name="location" className="std-input" onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Date</label>
                        <input name="date" type="date" className="std-input" onChange={handleChange} />
                    </div>
                </>
            )
        }

        if (type === "Intellectual Property") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">IP Type</label>
                        <select name="ipType" className="std-select" onChange={handleChange}>
                            <option value="Patent">Patent</option>
                            <option value="Copyright">Copyright</option>
                            <option value="Trademark">Trademark</option>
                        </select>
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Title</label>
                        <input name="title" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Application / Reg. Number</label>
                        <input name="appNumber" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Status</label>
                        <select name="status" className="std-select" onChange={handleChange}>
                            <option value="Filed">Filed</option>
                            <option value="Published">Published</option>
                            <option value="Granted">Granted</option>
                        </select>
                    </div>
                </>
            )
        }

        if (type === "Professional Development") {
            return (
                <>
                    <div className="std-form-group full-width">
                        <label className="std-label">FDP / Program Title</label>
                        <input name="title" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Role</label>
                        <select name="role" className="std-select" onChange={handleChange}>
                            <option value="Participant">Participant</option>
                            <option value="Resource Person">Resource Person</option>
                        </select>
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Organizing Body</label>
                        <input name="organizer" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Duration</label>
                        <input name="duration" className="std-input" onChange={handleChange} placeholder="e.g. 5 Days" />
                    </div>
                </>
            )
        }

        if (type === "Research Consultancy") {
            return (
                <>
                    <div className="std-form-group">
                        <label className="std-label">Project Name</label>
                        <input name="projectName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Industry Partner</label>
                        <input name="partner" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Role</label>
                        <input name="role" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Status / Outcomes</label>
                        <input name="status" className="std-input" onChange={handleChange} />
                    </div>
                </>
            )
        }

        if (type === "Mentorship & Student Training") {
            return (
                <>
                    <div className="std-form-group full-width">
                        <label className="std-label">Program Name</label>
                        <input name="programName" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">No. of Students Trained</label>
                        <input name="studentsTrained" type="number" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Certification Body</label>
                        <input name="certBody" className="std-input" onChange={handleChange} />
                    </div>
                </>
            )
        }

        if (type === "Books & Literature") {
            return (
                <>
                    <div className="std-form-group full-width">
                        <label className="std-label">Book Title</label>
                        <input name="title" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Publisher</label>
                        <input name="publisher" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">ISBN</label>
                        <input name="isbn" className="std-input" required onChange={handleChange} />
                    </div>
                    <div className="std-form-group">
                        <label className="std-label">Year</label>
                        <input name="date" className="std-input" placeholder="Year" onChange={handleChange} />
                    </div>
                </>
            )
        }

        // Default Fallback
        return (
            <div className="std-form-group full-width">
                <label className="std-label">Title / Description</label>
                <input name="title" className="std-input" required onChange={handleChange} />
            </div>
        );
    };

    return (
        <div className="upload-form-container">
            <h3 className="upload-form-header">Upload New Achievement</h3>

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <label className="section-label">1. Personal Details</label>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="std-form-group">
                            <label className="std-label">Name</label>
                            <input className="std-input" value={sessionStorage.getItem('username') || ''} disabled />
                        </div>
                        {isStudent && (
                            <>
                                <div className="std-form-group">
                                    <label className="std-label">Roll Number</label>
                                    <input className="std-input" value={userId || ''} disabled />
                                </div>
                                <div className="std-form-group">
                                    <label className="std-label">Batch</label>
                                    <input className="std-input" value={sessionStorage.getItem('userBatch') || 'N/A'} disabled />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <label className="section-label">2. Achievement Details</label>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="std-form-group full-width">
                            <label className="std-label">Achievement Category</label>
                            <select
                                name="type"
                                className="std-select"
                                value={formData.type}
                                onChange={handleTypeChange}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {renderFields()}
                    </div>
                </div>

                <div className="form-section">
                    <label className="section-label">3. Proof of Achievement</label>
                    <div className="std-form-group full-width">
                        <label className="std-label">Upload Proof (PDF/DOCX)</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="std-file-input"
                            onChange={handleFileChange}
                        />
                        <small style={{ color: '#6b7280', fontSize: '12px' }}>
                            Upload a document to validate this achievement.
                        </small>
                    </div>
                </div>

                <div className="submit-section">
                    <button type="button" className="cancel-btn" onClick={onCancel} style={{ marginRight: '10px' }}>Cancel</button>
                    <button type="submit" className="std-btn">
                        <FaSave style={{ marginRight: '8px' }} /> Save Achievement
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AchievementForm;
