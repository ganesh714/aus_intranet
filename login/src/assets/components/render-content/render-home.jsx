import React, { useState } from 'react';
import './render-home.css';
import img1 from '../images/11.png';
import { useNavigate } from 'react-router-dom';
import img3 from '../images/logo copy.jpg';
import axios from 'axios';

function Home() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const email = sessionStorage.getItem('userEmail');
    const role = sessionStorage.getItem('userRole');
    const subRole = sessionStorage.getItem('usersubRole');

    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordPattern.test(password);
    };

    const NavigateFaculty=()=>{
        window.location.href="http://localhost:82/ProfSense/Display/display.html"
    }

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const handleChangePassword = async (e) => { 
        e.preventDefault();
        setErrorMessage(''); // Clear previous error
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
            setShowPasswordModal(false); // Close the password change modal
        } catch (error) {
            console.error(error);
            alert('Failed to change password. Please check your current password.');
        }
    };

    return (
        <>
            <div className="home">
                <div className="header">
                    <img src={img1} className="aulogo" alt="AULogo" />
                        {/* {
                            role === "HOD" && subRole === "IT" && (
                                <button onClick={NavigateFaculty} className='faculty'>Faculty Status</button>
                            )
                        } */}
                    <div className="profile-container">
                        {/* Change Password and Logout Icons */}
                        <button onClick={() => setShowPasswordModal(true)} className="header-profile-buttons">
                        Change passsword
                        </button>
                        <button onClick={handleLogout} className="header-profile-buttons">
                            LogOut
                        </button>
                    </div>
                </div>
                <div className="banner">
                    <img src={img3} className="bannerpic" alt="Banner" />
                    <div className="banner-text">
                        WELCOME TO ADITYA UNIVERSITY INTRANET
                    </div>
                </div>
                
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="change-password-modal">
                    <div className="modal-content">
                        <h2 className='change-password-heading'>Change Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <div>
                                <label htmlFor="currentPassword">Current Password:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={changePasswordData.currentPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword">New Password:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={changePasswordData.newPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                    required
                                />
                                {errorMessage && <div className="error-message">{errorMessage}</div>}
                            </div>
                            <br/>
                            <button type="submit" className='changepassword-button'>Change Password</button>
                        </form>
                        <button onClick={() => setShowPasswordModal(false)} className="close-modal-button">Close</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;
