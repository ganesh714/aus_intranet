import React from 'react';
import './Announcements.css';
import { FaTrash } from 'react-icons/fa';

const AnnouncementForm = ({
    formData,
    roleOptions,
    subRolesMapping,
    myAnnouncements,
    onChange,
    onFileChange,
    onSubmit,
    onDelete // New prop
}) => {
    return (
        <div className="announce-container">
            <h2>Send New Announcement</h2>
            <form className="announce-form" onSubmit={onSubmit}>
                <div className="std-form-group">
                    <label className="std-label">Title</label>
                    <input className="std-input" type="text" name="title" value={formData.title} onChange={onChange} required placeholder="Enter announcement title" />
                </div>
                <div className="std-form-group">
                    <label className="std-label">Description</label>
                    <textarea className="std-textarea" name="description" value={formData.description} onChange={onChange} required rows="4" />
                </div>
                <div className="target-builder">
                    <label className="std-label">Target Audience</label>
                    <div className="form-row">
                        <div className="std-form-group half">
                            <select className="std-select" name="targetRole" value={formData.targetRole} onChange={onChange}>
                                {roleOptions.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="std-form-group half">
                            <select className="std-select" name="targetSubRole" value={formData.targetSubRole} onChange={onChange}>
                                {(subRolesMapping[formData.targetRole] || ['All']).map((sr, i) => (
                                    <option key={i} value={sr}>{sr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Conditionally render Batch input for Students */}
                        {formData.targetRole === 'Student' && (
                            <div className="std-form-group half">
                                <select
                                    name="targetBatch"
                                    value={formData.targetBatch || ''}
                                    onChange={onChange}
                                    className="std-select"
                                >
                                    <option value="">Select Batch</option>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                        <option key={year} value={year}>{year - 4}-{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            className="std-btn"
                            style={{ height: 'auto', alignSelf: 'flex-end', marginBottom: '4px' }}
                            onClick={formData.onAddTarget}
                            disabled={formData.targetRole === 'Student' && !formData.targetBatch}
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
                <div className="std-form-group">
                    <label className="std-label">Attachment (Optional)</label>
                    <input className="std-file-input" type="file" onChange={onFileChange} />
                </div>
                <div className="std-form-footer">
                    <button type="submit" className="std-btn">Send Announcement</button>
                </div>
            </form>

            <div className="my-announcements-section">
                <h3>Announcements Sent By Me</h3>
                {myAnnouncements.length === 0 ? <p className="no-data">No history.</p> : (
                    <div className="announcement-list">
                        {myAnnouncements.map((item, index) => (
                            <div key={index} className="announcement-card">
                                <div className="ac-header">
                                    <h4>{item.title}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span className="ac-date">{new Date(item.uploadedAt).toLocaleDateString('en-GB')}</span>
                                        <button
                                            type="button"
                                            className="std-btn-danger std-btn-sm"
                                            onClick={() => onDelete(item._id)}
                                            title="Delete Announcement"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
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