import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import './LoginForm.css';

const LoginForm = ({ setIsLoggedIn, setUserRole, setUsersubRole }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',  
        subRole: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const role = sessionStorage.getItem('userRole');
        const subRole = sessionStorage.getItem('usersubRole');
        
        if (isLoggedIn) {
            setIsLoggedIn(true);
            navigate(`/${role?.toLowerCase()}-page`);
        }
        
        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, [navigate, setIsLoggedIn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage('');
    };

    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordPattern.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (isRegistering) {
            // Registration logic
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            if (!validatePassword(formData.password)) {
                alert(
                    'Password must be 8 characters include letters, numbers, and special characters.'
                );
                return;
            }
    
            try {
                const response = await axios.post('http://localhost:5001/register', formData);
                alert(response.data.message);
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: '',
                    subRole: '',
                });
                setIsRegistering(false);
            } catch (error) {
                console.error('Error during registration:', error);
    
                if (error.response) {
                    // Server responded with a status code other than 2xx
                    const errorMessage = error.response.data.message;
    
                    if (errorMessage.includes('User with this role and subRole already exists')) {
                        alert('User already existed.');
                    } else if (errorMessage.includes('Email already exists')) {
                        alert('Email already existed.');
                    } else {
                        alert('Registration failed. Please try again.');
                    }
                } else if (error.request) {
                    // Request was made but no response received
                    console.error('Request error:', error.request);
                    alert('Network error. Please try again later.');
                } else {
                    // Something else caused the error
                    console.error('General error:', error.message);
                    alert('An unexpected error occurred. Please try again.');
                }
            }
            
        } else {
            // Login logic
            try {
                const response = await axios.post('http://localhost:5001/login', {
                    email: formData.email,
                    password: formData.password,
                });

                const { email, username, role , subRole} = response.data.user;

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('usersubRole', subRole);
                sessionStorage.setItem('username', username);

                setIsLoggedIn(true);
                setUserRole(role);
                setUsersubRole(subRole);
                

                navigate(`/${role.toLowerCase()}-page`);
            } catch (error) {
                console.error(error);
                setErrorMessage('Invalid credentials.');
            }
        }
    };

    const renderSubRoleOptions = () => {
        if (formData.role === 'Officers') {
            return (
                <div className="subrolecss">
                    <label htmlFor="subRole">Position:</label>
                    <select
                        id="subRole"
                        name="subRole"
                        value={formData.subRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Position</option>
                        <option value="DyPC">DyPC</option>
                        <option value="VC">VC</option>
                        <option value="ProVC">ProVC</option>
                        <option value="Registrar">Registrar</option>
                    </select>
                </div>
            );
        }
        if (formData.role === 'Dean') {
            return (
                <div className="subrolecss">
                    <label htmlFor="subRole">Department:</label>
                    <select
                        id="subRole"
                        name="subRole"
                        value={formData.subRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="IQAC">IQAC</option>
                        <option value="R&C">R&C</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="CD">CD</option>
                        <option value="SA">SA</option>
                        <option value="IR">IR</option>
                        <option value="AD">AD</option>
                        <option value="SOE">SOE</option>
                        <option value="COE">COE</option>
                        <option value="SOP">SOP</option>
                    </select>
                </div>
            );
        }

        if (formData.role === 'Asso.Dean') {
            return (
                <div className="subrolecss">
                    <label htmlFor="subRole">Department:</label>
                    <select
                        id="subRole"
                        name="subRole"
                        value={formData.subRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="SOE">SOE</option>
                        <option value="IQAC">IQAC</option>
                        <option value="AD">AD</option>
                        <option value="FED">FED</option>
                    </select>
                </div>
            );
        }

        if (formData.role === 'HOD') {
            return (
                <div className="subrolecss">
                    <label htmlFor="subRole">Department:</label>
                    <select
                        id="subRole"
                        name="subRole"
                        value={formData.subRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="IT">IT</option>
                        <option value="CSE">CSE</option>
                        <option value="AIML">AIML</option>
                        <option value="CE">CE</option>
                        <option value="MECH">MECH</option>
                        <option value="EEE">EEE</option>
                        <option value="ECE">ECE</option>
                        <option value="Ag.E">Ag.E</option>
                        <option value="MPE">MPE</option>
                        <option value="FED">FED</option>
                    </select>
                </div>
            );
        }

        if (formData.role === 'Faculty') {
            return (
                <div className="subrolecss">
                    <label htmlFor="department">Department:</label>
                    <select
                        id="department"
                        name="subRole"  
                        value={formData.subRole}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="IT">IT</option>
                        <option value="CSE">CSE</option>
                        <option value="AIML">AIML</option>
                        <option value="CE">CE</option>
                        <option value="MECH">MECH</option>
                        <option value="EEE">EEE</option>
                        <option value="ECE">ECE</option>
                        <option value="Ag.E">Ag.E</option>
                        <option value="MPE">MPE</option>
                        <option value="FED">FED</option>
                    </select>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className={`login-container ${isRegistering ? 'registering' : ''}`}>
            <h2 className="login-header">{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                {isRegistering && (
                    <>
                        <div className="login-form-group">
                            <label htmlFor="username">Staff Name:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="role">Role:</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select your role</option>
                                <option value="Officers">Officers</option>
                                <option value="Dean">Dean</option>
                                <option value="Asso.Dean">Asso.Dean</option>
                                <option value="HOD">HOD</option>
                                <option value="Faculty">Faculty</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        {renderSubRoleOptions()}
                    </>
                )}
                <div className="login-form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="login-form-group">
                    <label htmlFor="password">Password:</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle-icon"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                </div>
                {isRegistering && (
                    <div className="login-form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle-icon"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                )}
                <button type="submit" className="button1">
                    {isRegistering ? 'Register' : 'Login'}
                </button>
                <p
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="register-toggle"
                >
                    {isRegistering
                        ? 'Already have an account? Login'
                        : 'Don’t have an account? Register'}
                </p>
                {!isRegistering && (
                    <p
                        id="forgot-password"
                        onClick={() => navigate('/reset-password')}
                    >
                        Forgot Password?
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginForm;
