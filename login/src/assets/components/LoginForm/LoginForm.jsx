import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginForm.css';

const LoginForm = ({ setIsLoggedIn, setUserRole, setUserId }) => {
    const [formData, setFormData] = useState({
        id: '',
        role: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // If token exists, redirect automatically
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (token && role) {
            setIsLoggedIn(true);
            setUserRole(role);
            setUserId(localStorage.getItem("userId"));
            navigate(`/${role.toLowerCase()}/dashboard`);
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
    };

    return (
        <div className="login-container">
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
            </form>
        </div>
    );
};

export default LoginForm;
