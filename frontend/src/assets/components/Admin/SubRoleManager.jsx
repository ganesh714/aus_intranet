import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './SubRoleManager.css';

const AVAILABLE_FEATURES = [
    { id: 'MANAGE_IQAC', label: 'Dean IQAC / IQAC Access' },
    { id: 'UPLOAD_SYLLABUS', label: 'Upload Syllabus (Pro-VC Academics)' }
    // Add more features here in the future, e.g. { id: 'MANAGE_FINANCE', label: 'Finance Access' }
];

const SubRoleManager = () => {
    const [subRoles, setSubRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        displayName: '',
        allowedRoles: [],
        specialFeatures: []
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const rolesEnum = ['Student', 'Faculty', 'HOD', 'Asso.Dean', 'Dean', 'Officers'];

    useEffect(() => {
        fetchSubRoles();
    }, []);

    const fetchSubRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
            setSubRoles(response.data.subRoles);
        } catch (error) {
            console.error('Error fetching subroles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRoleCheckbox = (role) => {
        const currentRoles = formData.allowedRoles;
        if (currentRoles.includes(role)) {
            setFormData({ ...formData, allowedRoles: currentRoles.filter(r => r !== role) });
        } else {
            setFormData({ ...formData, allowedRoles: [...currentRoles, role] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/update-subrole/${editingId}`, formData);
                alert('SubRole updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-subrole`, formData);
                alert('SubRole added successfully!');
            }
            resetForm();
            fetchSubRoles();
        } catch (error) {
            console.error('Error saving subrole:', error);
            alert('Failed to save subrole. Check console for details.');
        }
    };

    const handleEdit = (role) => {
        setFormData({
            name: role.name,
            code: role.code,
            displayName: role.displayName,
            allowedRoles: role.allowedRoles || [],
            specialFeatures: role.specialFeatures || []
        });
        setEditingId(role._id);
        setShowForm(true);
        // Scroll to top or form if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', displayName: '', allowedRoles: [], specialFeatures: [] });
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this SubRole?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-subrole/${id}`);
            fetchSubRoles();
        } catch (error) {
            console.error('Error deleting subrole:', error);
        }
    };

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <div>
                    <h2>Manage Departments / SubRoles</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Add, remove, and manage sub-departments and roles available in the system.</p>
                </div>
                
                {showForm ? (
                    <button className="std-btn" onClick={resetForm} style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                         View All
                    </button>
                ) : (
                     <button className="std-btn" onClick={() => setShowForm(true)}>
                         <FaPlus /> Add SubRole
                     </button>
                )}
            </div>

            {showForm && (
                <div className="upload-form-container" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '30px' }}>
                    <form onSubmit={handleSubmit} className="std-form">
                        <h3 className="section-title">{editingId ? 'Edit SubRole' : 'Add New SubRole'}</h3>
                        
                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Code (Unique ID)</label>
                                <input type="text" className="std-input" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. CSE" />
                            </div>
                            <div className="std-form-group half">
                                <label className="std-label">Display Name (UI)</label>
                                <input type="text" className="std-input" name="displayName" value={formData.displayName} onChange={handleChange} required placeholder="e.g. CSE" />
                            </div>
                        </div>

                        <div className="std-form-group">
                            <label className="std-label">Name (Full / Formal)</label>
                            <input type="text" className="std-input" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Computer Science and Engineering" />
                        </div>

                        <div className="form-row">
                            <div className="std-form-group half">
                                <label className="std-label">Allowed Roles:</label>
                                <div className="checkbox-group">
                                    {rolesEnum.map(role => (
                                        <label key={role} className="checkbox-label" style={{ width: '45%' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.allowedRoles.includes(role)}
                                                onChange={() => handleRoleCheckbox(role)}
                                            />
                                            {role}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="std-form-group half">
                                <label className="std-label">Special Features (Optional)</label>
                                <div className="checkbox-group">
                                    {AVAILABLE_FEATURES.map(feature => (
                                        <label key={feature.id} className="checkbox-label" style={{ width: '100%' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.specialFeatures.includes(feature.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            specialFeatures: [...formData.specialFeatures, feature.id]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            specialFeatures: formData.specialFeatures.filter(f => f !== feature.id)
                                                        });
                                                    }
                                                }}
                                            />
                                            {feature.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="std-form-footer" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={resetForm} className="std-btn std-btn-secondary" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                                Cancel
                            </button>
                            <button type="submit" className="std-btn">
                                {editingId ? 'Update SubRole' : 'Save Details'}
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
                                <th>Code</th>
                                <th>Display Name</th>
                                <th>Full / Formal Name</th>
                                <th>Allowed Roles</th>
                                <th>Special Features</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subRoles.length > 0 ? (
                                subRoles.map(role => (
                                    <tr key={role._id}>
                                        <td><strong>{role.code}</strong></td>
                                        <td>{role.displayName}</td>
                                        <td>{role.name}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {role.allowedRoles.map(r => (
                                                    <span key={r} className="role-badge" style={{ margin: 0 }}>{r}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {role.specialFeatures && role.specialFeatures.length > 0
                                                    ? role.specialFeatures.map(f => (
                                                        <span key={f} className="feature-badge" style={{ margin: 0, fontSize: '11px' }}>{f.replace('MANAGE_', '').replace('UPLOAD_', '')}</span>
                                                    ))
                                                    : <span style={{color: '#94a3b8', fontSize: '13px'}}>None</span>
                                                }
                                            </div>
                                        </td>
                                        <td style={{ display: 'flex', gap: '10px' }}>
                                            <button className="edit-btn" onClick={() => handleEdit(role)} title="Edit">
                                                Edit
                                            </button>
                                            <button className="std-btn-sm std-btn-danger" onClick={() => handleDelete(role._id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                        No departments found. Click "Add SubRole" to get started.
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

export default SubRoleManager;
