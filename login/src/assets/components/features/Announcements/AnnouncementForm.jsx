import React from 'react';
import './Announcements.css';

const AnnouncementForm = ({
    formData,
    roleOptions,
    subRolesMapping,
    myAnnouncements,
    onChange,
    onFileChange,
    onSubmit
}) => {
    return (
        <div className="announce-container">
            <h2>Send New Announcement</h2>
            <form className="announce-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value={formData.title} onChange={onChange} required placeholder="Enter announcement title" />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={onChange} required rows="4" />
                </div>
                <div className="target-builder">
                    <label>Target Audience</label>
                    <div className="form-row">
                        <div className="form-group half">
                            <select name="targetRole" value={formData.targetRole} onChange={onChange}>
                                {roleOptions.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-group half">
                            <select name="targetSubRole" value={formData.targetSubRole} onChange={onChange}>
                                {(subRolesMapping[formData.targetRole] || ['All']).map((sr, i) => (
                                    <option key={i} value={sr}>{sr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Conditionally render Batch input for Students */}
                        {formData.targetRole === 'Student' && (
                            <div className="form-group half">
                                <input
                                    type="text"
                                    name="targetBatch"
                                    value={formData.targetBatch || ''}
                                    onChange={onChange}
                                    placeholder="Enter Batch (e.g. 2024)"
                                    className="batch-input"
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            className="add-target-btn"
                            onClick={formData.onAddTarget}
                            disabled={formData.targetRole === 'Student' && (!formData.targetBatch || !formData.targetBatch.trim())}
                        >
                            Add
                        </button>
                    </div>

                    {formData.targets && formData.targets.length > 0 && (
                        <div className="added-targets-list">
                            {formData.targets.map((t, idx) => (
                                <span key={idx} className="target-chip">
                                    {t.role} - {t.subRole} {t.batch && `(${t.batch})`}
                                    <button type="button" onClick={() => formData.onRemoveTarget(idx)}>×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>Attachment (Optional)</label>
                    <input type="file" onChange={onFileChange} />
                </div>
                <button type="submit" className="send-btn">Send Announcement</button>
            </form>

            <div className="my-announcements-section">
                <h3>Announcements Sent By Me</h3>
                {myAnnouncements.length === 0 ? <p className="no-data">No history.</p> : (
                    <div className="announcement-list">
                        {myAnnouncements.map((item, index) => (
                            <div key={index} className="announcement-card">
                                <div className="ac-header">
                                    <h4>{item.title}</h4>
                                    <span className="ac-date">{new Date(item.uploadedAt).toLocaleDateString('en-GB')}</span>
                                </div>
                                <p className="ac-desc">{item.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementForm;