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
    const [permTypeFilter, setPermTypeFilter] = useState('All');
    const [toggling, setToggling] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm, roleFilter, permTypeFilter]);

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
        // Collect all roles that can receive at least one special permission
        const allEligibleRoles = new Set(
            SPECIAL_PERMISSIONS.flatMap(p => p.eligibleRoles)
        );

        // Base: only users whose role can be assigned any permission
        let result = users.filter(u => allEligibleRoles.has(u.role));

        // When a specific permission type is chosen, further narrow to that permission's eligible roles
        if (permTypeFilter !== 'All') {
            const perm = SPECIAL_PERMISSIONS.find(p => p.key === permTypeFilter);
            if (perm) result = result.filter(u => perm.eligibleRoles.includes(u.role));
        }
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
            setUsers(prev => prev.map(u => {
                if (u.id !== user.id) return u;
                return { ...u, permissions: { ...u.permissions, [permKey]: !currentValue } };
            }));
        } catch (err) {
            console.error('Failed to update permission:', err);
            alert('Failed to update permission. Please try again.');
        } finally {
            setToggling(null);
        }
    };

    // If a specific permission type is selected, only show eligible roles in the Role dropdown
    const eligibleRolesForFilter = permTypeFilter === 'All'
        ? null
        : SPECIAL_PERMISSIONS.find(p => p.key === permTypeFilter)?.eligibleRoles || [];

    const uniqueRoles = [
        'All',
        ...new Set(
            users
                .filter(u => eligibleRolesForFilter === null || eligibleRolesForFilter.includes(u.role))
                .map(u => u.role)
        )
    ];

    // Show only the selected permission column(s)
    const visiblePermissions = permTypeFilter === 'All'
        ? SPECIAL_PERMISSIONS
        : SPECIAL_PERMISSIONS.filter(p => p.key === permTypeFilter);

    return (
        <div className="apm-container std-page-container">
            <div className="apm-page-header">
                <div className="apm-header-left">
                    <h2>Special Permissions</h2>
                    <p className="apm-header-sub">Assign special module access to specific users. Only eligible roles are shown.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="apm-toolbar">
                <div className="apm-search-wrap">
                    <label className="apm-filter-label">Search Users</label>
                    <div className="apm-search-wrap" style={{ width: '100%' }}>
                        <FaSearch className="apm-search-icon" />
                        <input
                            type="text"
                            className="apm-search-input"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Permission Type Filter */}
                <div className="apm-filter-wrap">
                    <label className="apm-filter-label">Permission Type</label>
                    <select
                        className="std-select apm-select"
                        value={permTypeFilter}
                        onChange={e => { setPermTypeFilter(e.target.value); setRoleFilter('All'); }}
                        style={{ width: '100%' }}
                    >
                        <option value="All">All Permissions</option>
                        {SPECIAL_PERMISSIONS.map(p => (
                            <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {/* Role Filter */}
                <div className="apm-filter-wrap">
                    <label className="apm-filter-label">Role</label>
                    <select
                        className="std-select apm-select"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        {uniqueRoles.map(r => (
                            <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results count */}
            {!loading && (
                <div className="apm-results-bar">
                    Showing <strong>{filtered.length}</strong> user{filtered.length !== 1 ? 's' : ''}
                    {permTypeFilter !== 'All' && <span className="apm-active-filter">
                        &nbsp;· Filtered by: {SPECIAL_PERMISSIONS.find(p => p.key === permTypeFilter)?.label}
                    </span>}
                    {roleFilter !== 'All' && <span className="apm-active-filter">&nbsp;· Role: {roleFilter}</span>}
                </div>
            )}
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
                                {visiblePermissions.map(p => (
                                    <th key={p.key} title={p.description}>{p.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3 + visiblePermissions.length} style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
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
                                        {visiblePermissions.map(perm => {
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
                                                            {isToggling ? (
                                                <span className="apm-toggle-spinner">...</span>
                                            ) : currentValue ? (
                                                <><FaCheck style={{ fontSize: 10 }} /> Granted</>
                                            ) : (
                                                'Grant Access'
                                            )}
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
