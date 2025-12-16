import React, { useState } from 'react';
import './render-home.css';
import img1 from '../images/11.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; // Added User Icon

function Home() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Fetch User Details
    const email = sessionStorage.getItem('userEmail');
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('userRole');
    const subRole = sessionStorage.getItem('usersubRole');

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
                email,
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
                        {/* User Info Display */}
                        <div className="user-info-display">
                            <div className="user-text">
                                <span className="user-name">Hi, {username || 'User'}</span>
                                <span className="user-role-badge">
                                    {role} {subRole && subRole !== 'null' ? ` • ${subRole}` : ''}
                                </span>
                            </div>
                            <FaUserCircle className="user-avatar-icon" />
                        </div>

                        <div className="header-actions">
                            {/* Change Password */}
                            <button onClick={() => setShowPasswordModal(true)} className="action-btn btn-change-pass">
                                <FaLock className="btn-icon" /> Change Password
                            </button>
                            
                            {/* LogOut */}
                            <button onClick={handleLogout} className="action-btn btn-logout">
                                <FaSignOutAlt className="btn-icon" /> LogOut
                            </button>
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
                            <div className="input-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    className="modal-input"
                                    type="password"
                                    id="currentPassword"
                                    value={changePasswordData.currentPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    className="modal-input"
                                    type="password"
                                    id="newPassword"
                                    value={changePasswordData.newPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                    required
                                />
                                {errorMessage && <div className="error-message">{errorMessage}</div>}
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className='modal-btn submit-btn'>Update</button>
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-btn close-btn">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;