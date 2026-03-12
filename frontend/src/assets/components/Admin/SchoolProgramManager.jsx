import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaBook } from 'react-icons/fa';
import './SchoolProgramManager.css';

const SchoolProgramManager = () => {
    const [programs, setPrograms] = useState([]);
    const [subRoles, setSubRoles] = useState([]);
    const [formData, setFormData] = useState({
        school: '',
        level: 'UG',
        program: '',
        duration: 4,
        departments: []
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const SCHOOLS = ['School of Engineering', 'School of Business', 'School of Sciences', 'School of Pharmacy'];
    const LEVELS = ['UG', 'PG'];

    useEffect(() => {
        fetchPrograms();
        fetchSubRoles();
    }, []);

    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-programs`);
            setPrograms(response.data.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const fetchSubRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
            // Only fetch HOD roles as they represent departments
            const branchSubRoles = response.data.subRoles.filter(sr => sr.allowedRoles && sr.allowedRoles.includes('HOD'));
            setSubRoles(branchSubRoles);
        } catch (error) {
            console.error('Error fetching subroles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Auto-link departments for B.Tech
    useEffect(() => {
        if (formData.program === 'B.Tech' || formData.program === 'BTech') {
             const linkedDepts = subRoles.map(sr => ({
                 name: sr.name,
                 subRoleRef: sr._id
             }));
             setFormData(prev => ({ ...prev, departments: linkedDepts }));
        } else if (!editingId && formData.departments.some(d => d.subRoleRef)) {
            // Clear if we switch away from B.Tech during creation
             setFormData(prev => ({ ...prev, departments: [] }));
        }
    }, [formData.program, subRoles, editingId]);

    const handleAddDepartment = () => {
        setFormData({
            ...formData,
            departments: [...formData.departments, { name: '', subRoleRef: null }]
        });
    };

    const handleDepartmentChange = (index, value) => {
        const updatedDepartments = [...formData.departments];
        updatedDepartments[index].name = value;
        setFormData({ ...formData, departments: updatedDepartments });
    };

    const handleRemoveDepartment = (index) => {
        const updatedDepartments = formData.departments.filter((_, i) => i !== index);
        setFormData({ ...formData, departments: updatedDepartments });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-program/${editingId}`, formData);
                alert('School Program updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-program`, formData);
                alert('School Program added successfully!');
            }
            resetForm();
            fetchPrograms();
        } catch (error) {
            console.error('Error saving program:', error);
            alert('Failed to save program. Check console for details.');
        }
    };

    const handleEdit = (prog) => {
        setFormData({
            school: prog.school,
            level: prog.level,
            program: prog.program,
            duration: prog.duration,
            departments: prog.departments.map(d => ({
                name: d.name,
                subRoleRef: d.subRoleRef ? d.subRoleRef._id : null
            }))
        });
        setEditingId(prog._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ school: '', level: 'UG', program: '', duration: 4, departments: [] });
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this School Program?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-program/${id}`);
            fetchPrograms();
        } catch (error) {
            console.error('Error deleting program:', error);
        }
    };

    const isBTech = formData.program === 'B.Tech' || formData.program === 'BTech';

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <div>
                    <h2>Manage Syllabus Schools & Programs</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Configure schools, levels, programs, and their associated departments.</p>
                </div>
                
                {showForm ? (
                    <button className="std-btn" onClick={resetForm} style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                         View All
                    </button>
                ) : (
                     <button className="std-btn" onClick={() => setShowForm(true)}>
                         <FaPlus /> Add Program
                     </button>
                )}
            </div>

            {showForm && (
                <div className="upload-form-container" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '30px' }}>
                    <form onSubmit={handleSubmit} className="std-form">
                        <h3 className="section-title">{editingId ? 'Edit Program' : 'Add New Program'}</h3>
                        
                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">School</label>
                                <select className="std-input" name="school" value={formData.school} onChange={handleChange} required>
                                    <option value="">Select School</option>
                                    {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Level (UG/PG)</label>
                                <select className="std-input" name="level" value={formData.level} onChange={handleChange} required>
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Program Name</label>
                                <input type="text" className="std-input" name="program" value={formData.program} onChange={handleChange} required placeholder="e.g. B.Tech, MBA, M.Sc" />
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Duration (Years)</label>
                                <select className="std-input" name="duration" value={formData.duration} onChange={handleChange} required>
                                    {[1, 2, 3, 4, 5].map(y => (
                                        <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Departments
                                {!isBTech && (
                                    <button type="button" onClick={handleAddDepartment} className="std-btn-sm" style={{ backgroundColor: '#e2e8f0', color: '#0f172a', padding: '4px 8px', fontSize: '12px' }}>
                                        + Add Manual Dept
                                    </button>
                                )}
                            </label>
                            
                            {isBTech && (
                                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '14px', marginBottom: '10px' }}>
                                    <strong>Note:</strong> Since this is a B.Tech program, departments are automatically linked to existing SubRoles (HODs) from the database.
                                </div>
                            )}

                            {formData.departments.length > 0 ? (
                                formData.departments.map((dept, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            className="std-input"
                                            value={dept.name}
                                            onChange={(e) => handleDepartmentChange(index, e.target.value)}
                                            placeholder="Department Name"
                                            disabled={isBTech}
                                            required
                                        />
                                        {!isBTech && (
                                            <button type="button" onClick={() => handleRemoveDepartment(index)} className="std-btn-sm std-btn-danger" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 15px' }}>
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No departments added yet.</p>
                            )}
                        </div>

                        <div className="std-form-footer" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={resetForm} className="std-btn std-btn-secondary" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                Cancel
                            </button>
                            <button type="submit" className="std-btn">
                                {editingId ? 'Update Program' : 'Save Details'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div style={{ overflowX: 'auto' }}>
                    <table className="std-table">
                        <thead>
                            <tr>
                                <th>School</th>
                                <th>Level</th>
                                <th>Program</th>
                                <th>Duration</th>
                                <th>Departments</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.length > 0 ? (
                                programs.map(prog => (
                                    <tr key={prog._id}>
                                        <td><strong>{prog.school}</strong></td>
                                        <td><span className="role-badge" style={{ backgroundColor: prog.level === 'UG' ? '#dbeafe' : '#fce7f3', color: prog.level === 'UG' ? '#1e40af' : '#be185d' }}>{prog.level}</span></td>
                                        <td>{prog.program}</td>
                                        <td>{prog.duration} yrs</td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {prog.departments.map((d, i) => (
                                                    <span key={i} className="feature-badge" style={{ margin: 0, fontSize: '11px', backgroundColor: d.subRoleRef ? '#dcfce7' : '#f1f5f9', color: d.subRoleRef ? '#166534' : '#475569' }}>
                                                        {d.name} {d.subRoleRef && '🔗'}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            <button className="edit-btn" onClick={() => handleEdit(prog)} title="Edit">
                                                Edit
                                            </button>
                                            <button className="std-btn-sm std-btn-danger" onClick={() => handleDelete(prog._id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                        No programs found. Click "Add Program" to configure syllabus hierarchy.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SchoolProgramManager;
