import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './Workshops.css';

const WorkshopManager = ({ userId }) => {
    const [workshops, setWorkshops] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Initial Form State
    const initialForm = {
        academicYear: '2023-2024',
        activityName: '',
        dates: '',
        coordinators: '',
        professionalBody: '',
        studentCount: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Load Data
    useEffect(() => {
        const stored = localStorage.getItem('user_workshops');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter for current user
                setWorkshops(parsed.filter(w => w.userId === userId));
            } catch (e) { console.error("Error loading workshops", e); }
        } else {
            // [NEW] Fake Data Seeding
            const fakeData = [
                { id: 'ws-001', academicYear: '2024-2025', activityName: 'AI & Machine Learning Workshop', dates: '10-12 Jan 2025', coordinators: 'Dr. Smith, Prof. A. Kumar', professionalBody: 'IEEE', studentCount: '120', userId: userId },
                { id: 'ws-002', academicYear: '2023-2024', activityName: 'Cyber Security Awareness Bootcamp', dates: '05-06 Dec 2023', coordinators: 'Prof. Alan Turing', professionalBody: 'CSI', studentCount: '85', userId: userId },
                { id: 'ws-003', academicYear: '2023-2024', activityName: 'Cloud Computing & DevOps Seminar', dates: '20 Nov 2023', coordinators: 'Dr. Rose Mary', professionalBody: 'ACM', studentCount: '200', userId: userId }
            ];
            setWorkshops(fakeData);
            // Save to storage nicely so it mimics real persistence (saving all as if they belong to this user for now)
            localStorage.setItem('user_workshops', JSON.stringify(fakeData));
        }
    }, [userId]);

    // Save Data Helper
    const saveToStorage = (updatedWorkshops) => {
        const stored = localStorage.getItem('user_workshops');
        let allWorkshops = stored ? JSON.parse(stored) : [];

        // Remove old entries for this user to avoid duplication (simple strategy)
        // Better strategy: Filter out USER's items from global list, then add NEW user items
        const othersWorkshops = allWorkshops.filter(w => w.userId !== userId);
        const finalSave = [...othersWorkshops, ...updatedWorkshops];

        localStorage.setItem('user_workshops', JSON.stringify(finalSave));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let updated;
        if (editId) {
            // Update existing
            updated = workshops.map(w => w.id === editId ? { ...formData, id: editId, userId } : w);
        } else {
            // Add new
            const newItem = { ...formData, id: Date.now().toString(), userId };
            updated = [...workshops, newItem];
        }

        setWorkshops(updated);
        saveToStorage(updated);
        resetForm();
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            const updated = workshops.filter(w => w.id !== id);
            setWorkshops(updated);
            saveToStorage(updated);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditId(null);
        setIsEditing(false);
        setShowForm(false);
    };

    return (
        <div className="std-page-container workshops-container">
            <div className="std-page-header">
                <h2>Workshops Conducted</h2>
                {!showForm && (
                    <button className="std-btn" onClick={() => setShowForm(true)}>
                        <FaPlus /> Add Workshop
                    </button>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <form className="workshops-form" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>{isEditing ? 'Edit Workshop' : 'Add New Workshop'}</h3>

                    <div className="form-grid">
                        <div className="std-form-group">
                            <label className="std-label">Academic Year</label>
                            <select
                                name="academicYear"
                                className="std-select"
                                value={formData.academicYear}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="2025-2026">2025-2026</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2023-2024">2023-2024</option>

                            </select>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Name of the Activity</label>
                            <input
                                type="text"
                                name="activityName"
                                className="std-input"
                                value={formData.activityName}
                                onChange={handleInputChange}
                                placeholder="e.g. AI Workflow Workshop"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Date(s)</label>
                            <input
                                type="text"
                                name="dates"
                                className="std-input"
                                value={formData.dates}
                                onChange={handleInputChange}
                                placeholder="e.g. 12th - 14th Oct 2023"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Resource Persons / Coordinators</label>
                            <input
                                type="text"
                                name="coordinators"
                                className="std-input"
                                value={formData.coordinators}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. Smith, Prof. Jane"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Professional Body Associated</label>
                            <input
                                type="text"
                                name="professionalBody"
                                className="std-input"
                                value={formData.professionalBody}
                                onChange={handleInputChange}
                                placeholder="e.g. IEEE, CSI"
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">No. of Students Participated</label>
                            <input
                                type="number"
                                name="studentCount"
                                className="std-input"
                                value={formData.studentCount}
                                onChange={handleInputChange}
                                placeholder="e.g. 150"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="std-btn std-btn-secondary" onClick={resetForm}>
                            <FaTimes /> Cancel
                        </button>
                        <button type="submit" className="std-btn">
                            <FaSave /> {isEditing ? 'Update Details' : 'Save Details'}
                        </button>
                    </div>
                </form>
            )}

            {/* TABLE SECTION */}
            <div className="workshops-table-container">
                <table className="std-table">
                    <thead>
                        <tr>
                            <th>Academic Year</th>
                            <th>Name of Activity</th>
                            <th>Date(s)</th>
                            <th>Resource Persons / Coordinators</th>
                            <th>Professional Body</th>
                            <th>Students</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workshops.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No workshops added yet. Click "Add Workshop" to get started.
                                </td>
                            </tr>
                        ) : (
                            workshops.map(w => (
                                <tr key={w.id}>
                                    <td>{w.academicYear}</td>
                                    <td><strong>{w.activityName}</strong></td>
                                    <td>{w.dates}</td>
                                    <td>{w.coordinators}</td>
                                    <td>{w.professionalBody || '-'}</td>
                                    <td>{w.studentCount}</td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button className="std-btn-sm std-btn-secondary" onClick={() => handleEdit(w)}>
                                            <FaEdit />
                                        </button>
                                        <button className="std-btn-sm std-btn-danger" onClick={() => handleDelete(w.id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkshopManager;
