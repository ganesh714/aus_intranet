import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './Workshops.css';
import axios from 'axios';

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
    const loadWorkshops = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-workshops`, {
                params: { userId }
            });
            setWorkshops(response.data.workshops || []);
        } catch (error) {
            console.error("Error fetching workshops:", error);
        }
    };

    useEffect(() => {
        if (userId) loadWorkshops();
    }, [userId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                // Update existing
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-workshop/${editId}`, formData);
            } else {
                // Add new
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-workshop`, {
                    userId,
                    ...formData
                });
            }
            loadWorkshops();
            resetForm();
        } catch (error) {
            console.error("Error saving workshop:", error);
            alert("Failed to save workshop");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            academicYear: item.academicYear,
            activityName: item.activityName,
            dates: item.dates,
            coordinators: item.coordinators,
            professionalBody: item.professionalBody,
            studentCount: item.studentCount
        });
        setEditId(item._id); // Use _id from MongoDB
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-workshop/${id}`);
                loadWorkshops();
            } catch (error) {
                console.error("Error deleting workshop:", error);
                alert("Failed to delete workshop");
            }
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
                                <tr key={w._id}>
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
                                        <button className="std-btn-sm std-btn-danger" onClick={() => handleDelete(w._id)}>
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
