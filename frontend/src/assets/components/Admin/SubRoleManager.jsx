import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './SubRoleManager.css';

const SubRoleManager = () => {
    const [subRoles, setSubRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        displayName: '',
        allowedRoles: []
    });

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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-subrole`, formData);
            alert('SubRole added successfully!');
            setFormData({ name: '', code: '', displayName: '', allowedRoles: [] });
            fetchSubRoles();
        } catch (error) {
            console.error('Error adding subrole:', error);
            alert('Failed to add subrole. Check console for details.');
        }
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
        <div className="subrole-manager-container">
            <div className="subrole-manager-header">
                <h2>Manage Departments / SubRoles</h2>
                <p style={{ color: '#64748b' }}>Add, remove, and manage sub-departments and roles available in the system.</p>
            </div>

            <div className="subrole-content-grid">

                {/* Left Column: Form */}
                <div className="subrole-form-card">
                    <h3>Add New SubRole</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name (Full)</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Computer Science and Engineering" />
                        </div>
                        <div className="form-group">
                            <label>Code (Unique ID)</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="CSE" />
                        </div>
                        <div className="form-group">
                            <label>Display Name (UI)</label>
                            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required placeholder="CSE" />
                        </div>

                        <div className="form-group">
                            <label>Allowed Roles:</label>
                            <div className="checkbox-group">
                                {rolesEnum.map(role => (
                                    <label key={role} className="checkbox-label">
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

                        <button type="submit" className="add-btn"><FaPlus /> Add SubRole</button>
                    </form>
                </div>

                {/* Right Column: List */}
                <div className="subrole-list-card">
                    <div className="subrole-list">
                        <div className="subrole-list-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Display Name</th>
                                        <th>Full Name</th>
                                        <th>Allowed Roles</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subRoles.length > 0 ? (
                                        subRoles.map(role => (
                                            <tr key={role._id}>
                                                <td><b>{role.code}</b></td>
                                                <td>{role.displayName}</td>
                                                <td>{role.name}</td>
                                                <td>
                                                    {role.allowedRoles.map(r => (
                                                        <span key={r} className="role-badge">{r}</span>
                                                    ))}
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete(role._id)} className="delete-btn" title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No SubRoles found. Add one to get started.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SubRoleManager;
