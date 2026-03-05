import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../Workshops/Workshops.css';
import axios from 'axios';

const FDP_STTP_OutsideManager = ({ userId }) => {
    const [records, setRecords] = useState([]);
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
        facultyName: '',
        eventName: '',
        startDate: '',
        endDate: '',
        durationDays: '',
        organisedBy: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Load Data
    const loadRecords = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-fdp-sttp-outside`, {
                params: { userId }
            });
            setRecords(response.data.records || []);
        } catch (error) {
            console.error("Error fetching FDP/STTP Outside records:", error);
        }
    };

    useEffect(() => {
        if (userId) loadRecords();
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
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-fdp-sttp-outside/${editId}`, formData);
            } else {
                // Add new
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-fdp-sttp-outside`, {
                    userId,
                    ...formData
                });
            }
            loadRecords();
            resetForm();
        } catch (error) {
            console.error("Error saving FDP/STTP record:", error);
            alert("Failed to save FDP/STTP record");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            academicYear: item.academicYear,
            facultyName: item.facultyName || '',
            eventName: item.eventName,
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            durationDays: item.durationDays,
            organisedBy: item.organisedBy
        });
        setEditId(item._id); // Use _id from MongoDB
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-fdp-sttp-outside/${id}`);
                loadRecords();
            } catch (error) {
                console.error("Error deleting FDP/STTP record:", error);
                alert("Failed to delete FDP/STTP record");
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
                <h2>FDP/STTP Attended Outside</h2>
                {!showForm && (
                    <button className="std-btn" onClick={() => setShowForm(true)}>
                        <FaPlus /> Add Record
                    </button>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <form className="workshops-form" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>{isEditing ? 'Edit FDP/STTP' : 'Add New FDP/STTP'}</h3>

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
                                    style={{ textAlign: 'center', width: '60%', borderTopRightRadius: '0', borderBottomRightRadius: '0', borderRight: 'none' }}
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
                            <label className="std-label">Name of the Faculty</label>
                            <input
                                type="text"
                                name="facultyName"
                                className="std-input"
                                value={formData.facultyName}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. John Doe"
                                required
                            />
                        </div>

                        <div className="std-form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="std-label">Name of the FDP/STTP attended</label>
                            <input
                                type="text"
                                name="eventName"
                                className="std-input"
                                value={formData.eventName}
                                onChange={handleInputChange}
                                placeholder="e.g. AI and Machine Learning Workhop"
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
                            <label className="std-label">Duration (No. of days)</label>
                            <input
                                type="number"
                                name="durationDays"
                                className="std-input"
                                value={formData.durationDays}
                                onChange={handleInputChange}
                                placeholder="e.g. 6"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Organised by</label>
                            <input
                                type="text"
                                name="organisedBy"
                                className="std-input"
                                value={formData.organisedBy}
                                onChange={handleInputChange}
                                placeholder="e.g. IIT Bombay"
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
                            <th>Faculty Name</th>
                            <th>FDP/STTP Name</th>
                            <th>Date(s)</th>
                            <th>Duration</th>
                            <th>Organised by</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No FDP/STTP records added yet.
                                </td>
                            </tr>
                        ) : (
                            records.map(w => (
                                <tr key={w._id}>
                                    <td>{w.academicYear}</td>
                                    <td>{w.facultyName}</td>
                                    <td><strong>{w.eventName}</strong></td>
                                    <td>{w.startDate ? new Date(w.startDate).toLocaleDateString() : '-'} to {w.endDate ? new Date(w.endDate).toLocaleDateString() : '-'}</td>
                                    <td>{w.durationDays} Days</td>
                                    <td>{w.organisedBy}</td>
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

export default FDP_STTP_OutsideManager;
