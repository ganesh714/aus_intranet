import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../Workshops/Workshops.css';
import axios from 'axios';

const GuestLecturesManager = ({ userId }) => {
    const [guestLectures, setGuestLectures] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Helper to get current academic year dynamically
    const getCurrentAcademicYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        // If current month is before June (5), we are in the previous academic year
        return today.getMonth() < 5 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
    };

    // Initial Form State
    const initialForm = {
        academicYear: getCurrentAcademicYear(),
        topic: '',
        startDate: '',
        endDate: '',
        resourcePerson: '',
        studentCount: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Load Data
    const loadGuestLectures = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-guest-lectures`, {
                params: { userId }
            });
            setGuestLectures(response.data.guestLectures || []);
        } catch (error) {
            console.error("Error fetching guest lectures:", error);
        }
    };

    useEffect(() => {
        if (userId) loadGuestLectures();
    }, [userId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleYearChange = (delta) => {
        const currentYearStart = parseInt(formData.academicYear.split('-')[0], 10);
        if (isNaN(currentYearStart)) return;
        const newYearStart = currentYearStart + delta;
        setFormData({ ...formData, academicYear: `${newYearStart}-${newYearStart + 1}` });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                // Update existing
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-guest-lecture/${editId}`, formData);
            } else {
                // Add new
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-guest-lecture`, {
                    userId,
                    ...formData
                });
            }
            loadGuestLectures();
            resetForm();
        } catch (error) {
            console.error("Error saving guest lecture:", error);
            alert("Failed to save guest lecture");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            academicYear: item.academicYear,
            topic: item.topic,
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            resourcePerson: item.resourcePerson,
            studentCount: item.studentCount
        });
        setEditId(item._id); // Use _id from MongoDB
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-guest-lecture/${id}`);
                loadGuestLectures();
            } catch (error) {
                console.error("Error deleting guest lecture:", error);
                alert("Failed to delete guest lecture");
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
                <h2>Guest Lectures</h2>
                {!showForm && (
                    <button className="std-btn" onClick={() => setShowForm(true)}>
                        <FaPlus /> Add Guest Lecture
                    </button>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <form className="workshops-form" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>{isEditing ? 'Edit Guest Lecture' : 'Add New Guest Lecture'}</h3>

                    <div className="form-grid">
                        <div className="std-form-group">
                            <label className="std-label">Academic Year</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    name="academicYear"
                                    className="std-input"
                                    value={formData.academicYear}
                                    readOnly
                                    style={{ textAlign: 'center', width: '120px', borderTopRightRadius: '0', borderBottomRightRadius: '0', borderRight: 'none' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleYearChange(1)}
                                        style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: '#f3f4f6', borderTopRightRadius: '4px', borderBottom: 'none' }}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleYearChange(-1)}
                                        style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: '#f3f4f6', borderBottomRightRadius: '4px' }}
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Guest Lecture Topic</label>
                            <input
                                type="text"
                                name="topic"
                                className="std-input"
                                value={formData.topic}
                                onChange={handleInputChange}
                                placeholder="e.g. AI Workflow"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Starting Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="std-input"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Ending Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="std-input"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Resource Person / Instructor</label>
                            <input
                                type="text"
                                name="resourcePerson"
                                className="std-input"
                                value={formData.resourcePerson}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. Smith"
                                required
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
                            <th>Guest Lecture Topic</th>
                            <th>Date(s)</th>
                            <th>Resource Person / Instructor</th>
                            <th>No. of Students Participated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guestLectures.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No guest lectures added yet.
                                </td>
                            </tr>
                        ) : (
                            guestLectures.map(w => (
                                <tr key={w._id}>
                                    <td>{w.academicYear}</td>
                                    <td><strong>{w.topic}</strong></td>
                                    <td>{w.startDate ? new Date(w.startDate).toLocaleDateString() : '-'} to {w.endDate ? new Date(w.endDate).toLocaleDateString() : '-'}</td>
                                    <td>{w.resourcePerson}</td>
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

export default GuestLecturesManager;
