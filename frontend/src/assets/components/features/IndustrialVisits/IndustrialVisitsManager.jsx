import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../Workshops/Workshops.css';
import axios from 'axios';

const IndustrialVisitsManager = ({ userId }) => {
    const [visits, setVisits] = useState([]);
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
        semester: '1',
        classSection: '',
        industryName: '',
        placeOfVisit: '',
        startDate: '',
        endDate: '',
        studentCount: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // Load Data
    const loadIndustrialVisits = async () => {
        try {
            const userDeptId = sessionStorage.getItem('userSubRoleId');
            const userDept = userDeptId || sessionStorage.getItem('usersubRole');

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-industrial-visits`, {
                params: { dept: userDept }
            });
            setVisits(response.data.industrialVisits || []);
        } catch (error) {
            console.error("Error fetching industrial visits:", error);
        }
    };

    useEffect(() => {
        if (userId) loadIndustrialVisits();
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
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-industrial-visit/${editId}`, formData);
            } else {
                // Add new
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-industrial-visit`, {
                    userId,
                    ...formData
                });
            }
            loadIndustrialVisits();
            resetForm();
        } catch (error) {
            console.error("Error saving industrial visit:", error);
            alert("Failed to save industrial visit");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            academicYear: item.academicYear,
            semester: item.semester,
            classSection: item.classSection,
            industryName: item.industryName,
            placeOfVisit: item.placeOfVisit,
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            studentCount: item.studentCount
        });
        setEditId(item._id); // Use _id from MongoDB
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-industrial-visit/${id}`);
                loadIndustrialVisits();
            } catch (error) {
                console.error("Error deleting industrial visit:", error);
                alert("Failed to delete industrial visit");
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
                <h2>Industrial Visits</h2>
                {!showForm && (
                    <button className="std-btn" onClick={() => setShowForm(true)}>
                        <FaPlus /> Add Visit
                    </button>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <form className="workshops-form" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>{isEditing ? 'Edit Industrial Visit' : 'Add New Industrial Visit'}</h3>

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
                            <label className="std-label">Semester</label>
                            <select
                                name="semester"
                                className="std-select"
                                value={formData.semester}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                            </select>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Class / Section</label>
                            <input
                                type="text"
                                name="classSection"
                                className="std-input"
                                value={formData.classSection}
                                onChange={handleInputChange}
                                placeholder="e.g. III B.Tech CSE-A"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Name of the Industry Visited</label>
                            <input
                                type="text"
                                name="industryName"
                                className="std-input"
                                value={formData.industryName}
                                onChange={handleInputChange}
                                placeholder="e.g. Infosys"
                                required
                            />
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Place of Visit</label>
                            <input
                                type="text"
                                name="placeOfVisit"
                                className="std-input"
                                value={formData.placeOfVisit}
                                onChange={handleInputChange}
                                placeholder="e.g. Hyderabad"
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
                            <label className="std-label">No. of Students Participated</label>
                            <input
                                type="number"
                                name="studentCount"
                                className="std-input"
                                value={formData.studentCount}
                                onChange={handleInputChange}
                                placeholder="e.g. 60"
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
                            <th>Semester</th>
                            <th>Class/Section</th>
                            <th>Industry Name</th>
                            <th>Place</th>
                            <th>Date(s)</th>
                            <th>Participants</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visits.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    No industrial visits added yet.
                                </td>
                            </tr>
                        ) : (
                            visits.map(w => (
                                <tr key={w._id}>
                                    <td>{w.academicYear}</td>
                                    <td>{w.semester}</td>
                                    <td>{w.classSection}</td>
                                    <td><strong>{w.industryName}</strong></td>
                                    <td>{w.placeOfVisit}</td>
                                    <td>{w.startDate ? new Date(w.startDate).toLocaleDateString() : '-'} to {w.endDate ? new Date(w.endDate).toLocaleDateString() : '-'}</td>
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

export default IndustrialVisitsManager;
