import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginForm.css';

const LoginForm = ({ setIsLoggedIn, setUserRole, setUsersubRole }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        id: '',
        password: '',
        confirmPassword: '',
        role: '',
        subRole: '',
        batch: '', // Added batch
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const role = sessionStorage.getItem('userRole');

        if (isLoggedIn) {
            setIsLoggedIn(true);
            const lowerRole = role?.toLowerCase() || '';
            if (lowerRole.includes('asso') && lowerRole.includes('dean')) {
                navigate('/asso.dean-page');
            } else {
                navigate(`/${lowerRole}-page`);
            }
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
        setErrorMessage('');

        if (isRegistering) {
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage('Passwords do not match!');
                return;
            }
            // if (!validatePassword(formData.password)) {
            //     setErrorMessage('Password must be 8 characters and include letters, numbers, and special characters.');
            //     return;
            // }

            try {
                const response = await axios.post('http://localhost:5001/register', formData);
                alert(response.data.message);
                setFormData({
                    username: '',
                    id: '',
                    password: '',
                    confirmPassword: '',
                    role: '',
                    subRole: '',
                    batch: '',
                });
                setIsRegistering(false);
            } catch (error) {
                console.error('Error during registration:', error);
                if (error.response) {
                    setErrorMessage(error.response.data.message || 'Registration failed.');
                } else {
                    setErrorMessage('Network error. Please try again later.');
                }
            }
        } else {
            try {
                const response = await axios.post('http://localhost:5001/login', {
                    id: formData.id,
                    password: formData.password,
                });

                const { id, username, role, subRole, canUploadTimetable, batch } = response.data.user;

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', id);
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('usersubRole', subRole);
                sessionStorage.setItem('userBatch', batch || ''); // Save Batch
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('canUploadTimetable', canUploadTimetable); // Save Permission Flag

                setIsLoggedIn(true);
                setUserRole(role);
                setUsersubRole(subRole);

                if (role === 'Student') {
                    navigate('/student-page');
                } else if (role.toLowerCase().includes('asso') && role.toLowerCase().includes('dean')) {
                    navigate('/asso.dean-page');
                } else {
                    navigate(`/${role.toLowerCase()}-page`);
                }
            } catch (error) {
                console.error(error);
                setErrorMessage('Invalid credentials. Please check your ID and password.');
            }
        }
    };

    const renderSubRoleOptions = () => {
        const commonDepartments = ["IT", "CSE", "AIML", "CE", "MECH", "EEE", "ECE", "Ag.E", "MPE", "FED"];

        if (formData.role === 'Officers') {
            return (
                <div className="std-form-group">
                    <label className="std-label" htmlFor="subRole">Position:</label>
                    <select id="subRole" name="subRole" value={formData.subRole} onChange={handleChange} required className="std-select">
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
                <div className="std-form-group">
                    <label className="std-label" htmlFor="subRole">Department:</label>
                    <select id="subRole" name="subRole" value={formData.subRole} onChange={handleChange} required className="std-select">
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
                <div className="std-form-group">
                    <label className="std-label" htmlFor="subRole">Department:</label>
                    <select id="subRole" name="subRole" value={formData.subRole} onChange={handleChange} required className="std-select">
                        <option value="">Select Department</option>
                        <option value="SOE">SOE</option>
                        <option value="IQAC">IQAC</option>
                        <option value="AD">AD</option>
                        <option value="FED">FED</option>
                    </select>
                </div>
            );
        }
        // Combined HOD, Faculty, and Student logic
        if (formData.role === 'HOD' || formData.role === 'Faculty' || formData.role === 'Student') {
            return (
                <div className="std-form-group">
                    <label className="std-label" htmlFor="subRole">Department:</label>
                    <select id="subRole" name="subRole" value={formData.subRole} onChange={handleChange} required className="std-select">
                        <option value="">Select Department</option>
                        {commonDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    {/* Conditionally render Batch input for Student */}
                    {formData.role === 'Student' && (
                        <div className="std-form-group" style={{ marginTop: '15px' }}>
                            <label className="std-label" htmlFor="batch">Batch (Year):</label>
                            <input
                                type="text"
                                id="batch"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 2024"
                                className="std-input"
                            />
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="login-container">
            <h2 className="login-header">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleSubmit}>
                {isRegistering && (
                    <>
                        <div className="std-form-group">
                            <label className="std-label" htmlFor="username">Full Name</label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="Enter your full name" className="std-input" />
                        </div>
                        <div className="std-form-group">
                            <label className="std-label" htmlFor="role">Role</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} required className="std-select">
                                <option value="">Select your role</option>
                                <option value="Officers">Officers</option>
                                <option value="Dean">Dean</option>
                                <option value="Asso.Dean">Asso.Dean</option>
                                <option value="HOD">HOD</option>
                                <option value="Faculty">Faculty</option>
                                <option value="Student">Student</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        {renderSubRoleOptions()}
                    </>
                )}

                <div className="std-form-group">
                    <label className="std-label" htmlFor="id">User ID</label>
                    <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} required placeholder="Enter User ID" className="std-input" />
                </div>

                <div className="std-form-group">
                    <label className="std-label" htmlFor="password">Password</label>
                    <div className="password-input-container">
                        <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" className="std-input" style={{ paddingRight: '40px' }} />
                        <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {isRegistering && (
                    <div className="std-form-group">
                        <label className="std-label" htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-container">
                            <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" className="std-input" style={{ paddingRight: '40px' }} />
                            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-icon">
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                )}

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <button type="submit" className="std-btn" style={{ width: '100%' }}>{isRegistering ? 'Register' : 'Login'}</button>

                <p onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrorMessage('');
                    setFormData({ username: '', id: '', password: '', confirmPassword: '', role: '', subRole: '', batch: '' });
                }} className="register-toggle">
                    {isRegistering ? 'Already have an account? Login' : 'Don’t have an account? Register'}
                </p>

                {!isRegistering && (
                    <span id="forgot-password" onClick={() => navigate('/reset-password')}>
                        Forgot Password?
                    </span>
                )}
            </form>
        </div>
    );
};

export default LoginForm;