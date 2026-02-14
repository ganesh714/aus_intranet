import React, { useState, useEffect, useRef } from 'react';
import './render-home.css';
import img1 from '../images/11.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaSignOutAlt, FaUserCircle, FaCog, FaBell, FaChevronDown } from 'react-icons/fa'; // Added Icons

function Home() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false); // [NEW] Profile Menu State
    const [showSettingsModal, setShowSettingsModal] = useState(false); // [NEW] Settings Modal State
    const [newUsername, setNewUsername] = useState(''); // [NEW] State for editing name
    const profileRef = useRef(null); // Ref for profile dropdown
    const navigate = useNavigate();

    // Fetch User Details
    const id = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('userRole');
    const subRole = sessionStorage.getItem('usersubRole');
    const batch = sessionStorage.getItem('userBatch'); // Read batch



    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/change-password`, {
                id,
                currentPassword: changePasswordData.currentPassword,
                newPassword: changePasswordData.newPassword,
            });
            alert(response.data.message);
            setChangePasswordData({ currentPassword: '', newPassword: '' });
            setShowPasswordModal(false);
        } catch (error) {
            console.error(error);
            alert('Failed to change password. Please check your current password.');
        }
    };

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (!newUsername.trim()) {
            alert("Username cannot be empty");
            return;
        }
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/auth/update-username`, {
                id,
                newUsername
            });

            // Update Session Storage
            sessionStorage.setItem('username', response.data.username);

            alert(response.data.message);
            setShowSettingsModal(false);
            window.location.reload(); // Reload to reflect changes globally
        } catch (error) {
            console.error(error);
            alert('Failed to update username.');
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    return (
        <>
            <div className="home-container">
                <div className="custom-header">
                    <div className="logo-section">
                        <img src={img1} className="aulogo" alt="AULogo" />
                    </div>

                    <div className="header-right-section">
                        {/* 1. Header Icons (Settings, Notification) */}
                        <div className="header-icons-group">
                            <div className="header-icon-btn" title="Settings" onClick={() => { setNewUsername(username); setShowSettingsModal(true); }}>
                                <FaCog />
                            </div>
                            <div className="header-icon-btn" title="Notifications">
                                <FaBell />
                                <span className="notification-badge"></span>
                            </div>
                        </div>

                        <div className="header-separator"></div>

                        {/* 2. User Profile Section (Clickable) */}
                        <div
                            className="user-profile-wrapper"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            ref={profileRef}
                        >
                            <div className="user-text">
                                <span className="user-name">{username || 'User'}</span>
                                <span className="user-role-badge">
                                    {role} {subRole && subRole !== 'null' ? ` • ${subRole}` : ''} • {id}
                                </span>
                            </div>
                            <div className="user-avatar-container">
                                <FaUserCircle className="user-avatar-icon" style={{ fontSize: '32px', color: '#9ca3af' }} />
                            </div>
                            <FaChevronDown className={`profile-arrow ${showProfileMenu ? 'open' : ''}`} />

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="profile-dropdown-menu">
                                    <div className="profile-menu-header">
                                        <div className="pm-name">{username}</div>
                                        <div className="pm-role">{role}</div>
                                    </div>
                                    <div className="profile-menu-item" onClick={(e) => { e.stopPropagation(); setShowPasswordModal(true); setShowProfileMenu(false); }}>
                                        <FaLock className="pm-icon" /> Change Password
                                    </div>
                                    <div className="profile-menu-divider"></div>
                                    <div className="profile-menu-item danger" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                                        <FaSignOutAlt className="pm-icon" /> LogOut
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Change Password Modal */}
            {
                showPasswordModal && (
                    <div className="std-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="std-modal" onClick={e => e.stopPropagation()}>
                            <div className="std-modal-header">
                                <h2 className="std-modal-title">Change Password</h2>
                                <button className="std-close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
                            </div>
                            <div className="std-modal-body">
                                <form onSubmit={handleChangePassword}>
                                    <div className="std-form-group">
                                        <label className="std-label" htmlFor="currentPassword">Current Password</label>
                                        <input
                                            className="std-input"
                                            type="password"
                                            id="currentPassword"
                                            value={changePasswordData.currentPassword}
                                            onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="std-form-group">
                                        <label className="std-label" htmlFor="newPassword">New Password</label>
                                        <input
                                            className="std-input"
                                            type="password"
                                            id="newPassword"
                                            value={changePasswordData.newPassword}
                                            onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                            required
                                        />
                                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                                    </div>
                                </form>
                            </div>
                            <div className="std-modal-footer">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="std-btn std-btn-secondary">Close</button>
                                <button type="button" className="std-btn" onClick={handleChangePassword}>Update</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Settings / Edit Profile Modal */}
            {
                showSettingsModal && (
                    <div className="std-modal-overlay" onClick={() => setShowSettingsModal(false)}>
                        <div className="std-modal" onClick={e => e.stopPropagation()}>
                            <div className="std-modal-header">
                                <h2 className="std-modal-title">Settings</h2>
                                <button className="std-close-btn" onClick={() => setShowSettingsModal(false)}>×</button>
                            </div>
                            <div className="std-modal-body">
                                <form onSubmit={handleUpdateUsername}>
                                    <div className="std-form-group">
                                        <label className="std-label" htmlFor="editUsername">Display Name</label>
                                        <input
                                            className="std-input"
                                            type="text"
                                            id="editUsername"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            required
                                        />
                                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>This name will be visible across the platform.</p>
                                    </div>
                                </form>
                            </div>
                            <div className="std-modal-footer">
                                <button type="button" onClick={() => setShowSettingsModal(false)} className="std-btn std-btn-secondary">Cancel</button>
                                <button type="button" className="std-btn" onClick={handleUpdateUsername}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default Home;