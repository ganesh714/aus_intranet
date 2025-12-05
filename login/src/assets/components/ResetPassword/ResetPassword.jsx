import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './resetpassword.css';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        // Basic email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError('Please enter a valid email address!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/reset-password', { email });
            setMessage(response.data.message);
            setEmail(''); // Clear the email field after success
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Invalid email address!');
            } else {
                setError('Error sending password reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="reset-password-container">
            <div className="reset-container">
                <h2 className="title">Reset Password</h2>
                <form onSubmit={handleReset} className="reset-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                    <button type="submit" className="reset-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={handleBack} className="reset-back-button">Back to Login</button>
                </form>
                {message && <p className="reset-message">{message}</p>}
                {error && <p className="reset-error">{error}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
