// backend/controllers/authController.js

const AuthService = require('../services/AuthService');

const register = async (req, res) => {
    try {
        await AuthService.register(req.body);
        res.json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        const status = err.statusCode || 500;
        res.status(status).json({ message: err.message || 'Error registering user', error: err });
    }
}

const login = async (req, res) => {
    const { id, password } = req.body;
    try {
        const { user, token } = await AuthService.login(id, password);
        res.json({ message: 'Login successful!', user, token });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({ message: err.message || 'Invalid credentials!' });
    }
}

const updateUsername = async (req, res) => {
    const { id, newUsername } = req.body;
    try {
        const user = await AuthService.updateUsername(id, newUsername);
        res.json({ message: 'Username updated successfully!', username: user.username });
    } catch (err) {
        console.error("Error updating username:", err);
        const status = err.statusCode || 500;
        res.status(status).json({ message: err.message || 'Error updating username', error: err.message });
    }
}

module.exports = { register, login, updateUsername };