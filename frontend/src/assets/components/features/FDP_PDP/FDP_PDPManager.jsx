import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../Workshops/Workshops.css';
import axios from 'axios';

const FDP_PDPManager = ({ userId }) => {
    const [records, setRecords] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Initial Form State
    const initialForm = {
        academicYear: '2023-2024',
        type: 'FDP',
        title: '',
        startDate: '',
        endDate: '',
        resourcePerson: '',
        participantCount: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Load Data
    const loadRecords = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-fdp-pdp`, {
                params: { userId }
            });
            setRecords(response.data.records || []);
        } catch (error) {
            console.error("Error fetching FDP/PDP records:", error);
        }
    };

    useEffect(() => {
        if (userId) loadRecords();
    }, [userId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                // Update existing
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-fdp-pdp/${editId}`, formData);
            } else {
                // Add new
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-fdp-pdp`, {
                    userId,
                    ...formData
                });
            }
            loadRecords();
            resetForm();
        } catch (error) {
            console.error("Error saving FDP/PDP record:", error);
            alert("Failed to save FDP/PDP record");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            academicYear: item.academicYear,
            type: item.type,
            title: item.title,
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            resourcePerson: item.resourcePerson,
            participantCount: item.participantCount
        });
        setEditId(item._id); // Use _id from MongoDB
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-fdp-pdp/${id}`);
                loadRecords();
            } catch (error) {
                console.error("Error deleting FDP/PDP record:", error);
                alert("Failed to delete FDP/PDP record");
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
                <h2>FDP / PDP</h2>
                {!showForm && (
                    <button className="std-btn" onClick={() => setShowForm(true)}>
                        <FaPlus /> Add Record
                    </button>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <form className="workshops-form" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>{isEditing ? 'Edit FDP/PDP' : 'Add New FDP/PDP'}</h3>

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
                            <label className="std-label">FDP / PDP</label>
                            <select
                                name="type"
                                className="std-select"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="FDP">FDP (Faculty Development Program)</option>
                                <option value="PDP">PDP (Professional Development Program)</option>
                            </select>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Title of the FDP/PDP</label>
                            <input
                                type="text"
                                name="title"
                                className="std-input"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Advanced AI Integration"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Details of the Resource Person(s)</label>
                            <input
                                type="text"
                                name="resourcePerson"
                                className="std-input"
                                value={formData.resourcePerson}
                                onChange={handleInputChange}
                                placeholder="e.g. Dr. John Doe, Prof. Smith"
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
                            <label className="std-label">No. of Participants</label>
                            <input
                                type="number"
                                name="participantCount"
                                className="std-input"
                                value={formData.participantCount}
                                onChange={handleInputChange}
                                placeholder="e.g. 100"
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
                            <th>Type</th>
                            <th>Title</th>
                            <th>Date(s)</th>
                            <th>Resource Person(s)</th>
                            <th>Participants</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No FDP / PDP records added yet.
                                </td>
                            </tr>
                        ) : (
                            records.map(w => (
                                <tr key={w._id}>
                                    <td>{w.academicYear}</td>
                                    <td><span style={{
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontWeight: 'bold', 
                                        fontSize: '12px',
                                        backgroundColor: w.type === 'FDP' ? '#dbeafe' : '#fef3c7',
                                        color: w.type === 'FDP' ? '#1e3a8a' : '#92400e'
                                    }}>{w.type}</span></td>
                                    <td><strong>{w.title}</strong></td>
                                    <td>{w.startDate ? new Date(w.startDate).toLocaleDateString() : '-'} to {w.endDate ? new Date(w.endDate).toLocaleDateString() : '-'}</td>
                                    <td>{w.resourcePerson}</td>
                                    <td>{w.participantCount}</td>
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

export default FDP_PDPManager;
