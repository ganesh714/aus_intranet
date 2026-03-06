import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaSearch, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import './AdminPermissionsManager.css';

// Configure the list of special permissions that Admin can assign.
// To add a new permission in the future, just add it here.
const SPECIAL_PERMISSIONS = [
    {
        key: 'canViewIQAC',
        label: 'IQAC Access',
        description: 'Can view and manage IQAC (Dept) module',
        eligibleRoles: ['Dean', 'Asso.Dean', 'Officers']
    },
    // Future permissions can be added here, e.g.:
    // { key: 'canViewFinance', label: 'Finance Access', ... }
];

const AdminPermissionsManager = () => {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [toggling, setToggling] = useState(null); // tracks userId+key being toggled

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm, roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/get-all-users`);
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...users];
        if (roleFilter !== 'All') {
            result = result.filter(u => u.role === roleFilter);
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.username?.toLowerCase().includes(term) ||
                u.id?.toLowerCase().includes(term) ||
                u.subRole?.toLowerCase().includes(term)
            );
        }
        setFiltered(result);
    };

    const handleToggle = async (user, permKey, currentValue) => {
        const toggleId = `${user.id}-${permKey}`;
        setToggling(toggleId);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/toggle-special-permission`, {
                id: user.id,
                permissionKey: permKey,
                allowed: !currentValue
            });
            // Update local state immediately for snappy UX
            setUsers(prev => prev.map(u => {
                if (u.id !== user.id) return u;
                return {
                    ...u,
                    permissions: { ...u.permissions, [permKey]: !currentValue }
                };
            }));
        } catch (err) {
            console.error('Failed to update permission:', err);
            alert('Failed to update permission. Please try again.');
        } finally {
            setToggling(null);
        }
    };

    const uniqueRoles = ['All', ...new Set(users.map(u => u.role))];

    return (
        <div className="apm-container std-page-container">
            <div className="std-page-header">
                <h2><FaShieldAlt style={{ marginRight: 10, color: '#6366f1' }} />Special Permissions</h2>
            </div>

            <div className="apm-info-banner">
                <p>
                    Manage which users have access to special modules. Changes take effect on the user's next page load.
                </p>
            </div>

            {/* Filters */}
            <div className="apm-toolbar">
                <div className="apm-search-wrap">
                    <FaSearch className="apm-search-icon" />
                    <input
                        type="text"
                        className="apm-search-input"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="apm-filter-wrap">
                    <select
                        className="std-select"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ minWidth: 140 }}
                    >
                        {uniqueRoles.map(r => (
                            <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="apm-loading">Loading users...</div>
            ) : (
                <div className="apm-table-wrap">
                    <table className="std-table apm-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Sub-Role / Dept</th>
                                {SPECIAL_PERMISSIONS.map(p => (
                                    <th key={p.key} title={p.description}>{p.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3 + SPECIAL_PERMISSIONS.length} style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="apm-user-cell">
                                                <div className="apm-user-avatar">
                                                    <FaUser />
                                                </div>
                                                <div>
                                                    <div className="apm-user-name">{user.username}</div>
                                                    <div className="apm-user-id">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`apm-role-badge apm-role-${user.role?.toLowerCase().replace('.', '')}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{user.subRole || '—'}</td>
                                        {SPECIAL_PERMISSIONS.map(perm => {
                                            const isEligible = perm.eligibleRoles.includes(user.role);
                                            const currentValue = user.permissions?.[perm.key] || false;
                                            const toggleId = `${user.id}-${perm.key}`;
                                            const isToggling = toggling === toggleId;

                                            return (
                                                <td key={perm.key} style={{ textAlign: 'center' }}>
                                                    {isEligible ? (
                                                        <button
                                                            className={`apm-toggle-btn ${currentValue ? 'apm-toggle-on' : 'apm-toggle-off'}`}
                                                            onClick={() => handleToggle(user, perm.key, currentValue)}
                                                            disabled={isToggling}
                                                            title={currentValue ? `Revoke ${perm.label}` : `Grant ${perm.label}`}
                                                        >
                                                            {isToggling ? '...' : currentValue ? <><FaCheck /> Granted</> : 'Grant'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#cbd5e1', fontSize: 12 }}>N/A</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPermissionsManager;
