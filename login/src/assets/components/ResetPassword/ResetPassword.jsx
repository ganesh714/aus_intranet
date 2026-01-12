import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './resetpassword.css';

const ResetPassword = () => {
    const [id, setId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!id.trim()) {
            setError('Please enter a valid ID!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/reset-password', { id });
            setMessage(response.data.message);
            setId(''); // Clear the id field after success
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Invalid user ID!');
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
                    <div className="std-form-group">
                        <input
                            type="text"
                            placeholder="Enter your User ID"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                            className="std-input"
                        />
                    </div>
                    <button type="submit" className="std-btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={handleBack} className="std-btn std-btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Back to Login</button>
                </form>
                {message && <p className="reset-message">{message}</p>}
                {error && <p className="reset-error">{error}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
