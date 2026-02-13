import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginForm.css';

const LoginForm = ({ setIsLoggedIn, setUserRole, setUserId }) => {
    const [formData, setFormData] = useState({
<<<<<<< HEAD
        id: '',
        role: '',
        password: ''
=======
        username: '',
        id: '',
        password: '',
        confirmPassword: '',
        role: '',
        subRole: '',
        batch: '', // Added batch
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

<<<<<<< HEAD
    // If token exists, redirect automatically
    useEffect(() => {
<<<<<<< HEAD
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (token && role) {
            setIsLoggedIn(true);
            setUserRole(role);
            setUserId(localStorage.getItem("userId"));
            navigate(`/${role.toLowerCase()}/dashboard`);
=======
=======
    const [subRolesList, setSubRolesList] = useState([]); // [NEW]

    useEffect(() => {
        // Fetch subroles on mount
        const fetchSubRoles = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
                setSubRolesList(response.data.subRoles);
            } catch (error) {
                console.error("Failed to fetch subroles", error);
            }
        };
        fetchSubRoles();

>>>>>>> origin/intranet-v3
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
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
        }

        document.body.classList.add('login-page');
        return () => {
            document.body.classList.remove('login-page');
        };
    }, [navigate, setIsLoggedIn, setUserRole, setUserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
<<<<<<< HEAD

        if (!formData.id || !formData.password || !formData.role) {
            setErrorMessage("All fields are required");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/api/login', {
                id: formData.id,
                password: formData.password,
                role: formData.role
            });

            const { token, user } = response.data;

            // ✅ Store in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("userId", user.id);

            setIsLoggedIn(true);
            setUserRole(user.role);
            setUserId(user.id);

            // Redirect to protected dashboard
            navigate(`/${user.role.toLowerCase()}/dashboard`);

        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage(error.response?.data?.message || "Invalid credentials");
        }
=======
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
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, formData);
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
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
                    id: formData.id,
                    password: formData.password,
                });

                const { id, username, role, subRole, subRoleId, canUploadTimetable, batch, permissions } = response.data.user;

                // Normalize Role (Fix for Associate Dean variations)
                let normalizedRole = role;
                if (role.toLowerCase().includes('asso') && role.toLowerCase().includes('dean')) {
                    normalizedRole = 'Asso.Dean';
                }

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', id);
                sessionStorage.setItem('userRole', normalizedRole);
                sessionStorage.setItem('usersubRole', subRole);
                if (subRoleId) sessionStorage.setItem('userSubRoleId', subRoleId); // [NEW] Store ID
                sessionStorage.setItem('userBatch', batch || ''); // Save Batch
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('canUploadTimetable', canUploadTimetable); // Save Permission Flag
                sessionStorage.setItem('permissions', JSON.stringify(permissions || {})); // [NEW] Save Permissions

                setIsLoggedIn(true);
                setUserRole(normalizedRole);
                setUsersubRole(subRole);

                if (normalizedRole === 'Student') {
                    navigate('/student-page');
                } else if (normalizedRole === 'Asso.Dean') {
                    navigate('/asso.dean-page');
                } else {
                    navigate(`/${normalizedRole.toLowerCase()}-page`);
                }
            } catch (error) {
                console.error(error);
                setErrorMessage('Invalid credentials. Please check your ID and password.');
            }
        }
    };

    const renderSubRoleOptions = () => {
        if (!formData.role || formData.role === 'Admin') return null;

        // Filter subroles based on selected role
        // For Students, Faculty, HOD -> show departments (allowedRoles includes one of these)
        // For Dean -> show Dean subroles
        // For Officers -> show Officer subroles

        const relevantSubRoles = subRolesList.filter(sr => sr.allowedRoles.includes(formData.role));

        if (relevantSubRoles.length === 0 && formData.role !== 'Admin') {
            // If no specific subroles found roughly matching, maybe fallback or show nothing
            // But usually we expect data. 
            return null;
        }
<<<<<<< HEAD
        return null;
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
=======

        const labelMap = {
            'Officers': 'Position',
            'Dean': 'Department/Role',
            'Asso.Dean': 'Department',
            'HOD': 'Department',
            'Faculty': 'Department',
            'Student': 'Department'
        };

        return (
            <div className="std-form-group">
                <label className="std-label" htmlFor="subRole">{labelMap[formData.role] || 'Department'}:</label>
                <select id="subRole" name="subRole" value={formData.subRole} onChange={handleChange} required className="std-select">
                    <option value="">Select {labelMap[formData.role] || 'Option'}</option>
                    {relevantSubRoles.map(sr => (
                        <option key={sr.code} value={sr.code}>{sr.displayName || sr.name}</option>
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
>>>>>>> origin/intranet-v3
    };

    return (
        <div className="login-container">
<<<<<<< HEAD
            <form onSubmit={handleSubmit}>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="Dean">Dean</option>
                    <option value="Leadership">Leadership</option>
                    <option value="SuperAdmin">Super Admin</option>
                </select>

                <div className="login-form-group">
                    <label htmlFor="email">ID:</label>
                    <input
                        type="text"
                        id="email"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="login-form-group">
                    <label htmlFor="password">Password:</label>
=======
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
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
                    <div className="password-input-container">
                        <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" className="std-input" style={{ paddingRight: '40px' }} />
                        <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
<<<<<<< HEAD

                    {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                    )}
                </div>

                <button type="submit" className="button1">Login</button>

                <p
                    id="forgot-password"
                    onClick={() => navigate('/reset-password')}
                >
                    Forgot Password?
                </p>
=======
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
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
            </form>
        </div>
    );
};

export default LoginForm;