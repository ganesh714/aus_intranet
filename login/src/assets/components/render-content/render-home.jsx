import React, { useState } from 'react';
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
    const navigate = useNavigate();

    // Fetch User Details
    const id = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('userRole');
    const subRole = sessionStorage.getItem('usersubRole');
    const batch = sessionStorage.getItem('userBatch'); // Read batch

    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordPattern.test(password);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        if (!validatePassword(changePasswordData.newPassword)) {
            setErrorMessage("New password must be at least 8 characters long, include letters, numbers, and special characters.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:5001/change-password', {
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
                            <div className="header-icon-btn" title="Settings">
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
                            tabIndex={0}
                            onBlur={(e) => {
                                // Close menu on blur (using timeout to allow click events on children)
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    // setTimeout(() => setShowProfileMenu(false), 200);
                                    // simpler: just let layout handle it or click outside listener
                                    // for now, strict click toggling
                                }
                            }}
                        >
                            <div className="user-text">
                                <span className="user-name">{username || 'User'}</span>
                                <span className="user-role-badge">
                                    {role} {subRole && subRole !== 'null' ? ` • ${subRole}` : ''}
                                    {role === 'Student' && batch ? ` • ${batch}` : ''}
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
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="change-password-modal">
                    <div className="modal-content">
                        <h2 className='change-password-heading'>Change Password</h2>
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
                            <div className="modal-actions">
                                <button type="submit" className='std-btn'>Update</button>
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="std-btn std-btn-secondary">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;