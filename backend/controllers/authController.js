// backend/controllers/authController.js

const User = require('../models/User');
const UserFactory = require('../factories/UserFactory');

const register = async (req, res) => {
    const { username, id, password, role, subRole, batch } = req.body;

    // Check for existing user (Case Insensitive)
    const existingUserById = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
    if (existingUserById) {
        return res.status(400).json({ message: 'User ID already exists' });
    }

    if (role !== 'Faculty' && role !== 'Admin' && role !== 'Student') {
        const existingUserByRoleAndSubRole = await User.findOne({ role, subRole });
        if (existingUserByRoleAndSubRole) {
            return res.status(400).json({ message: 'User with this role and subRole already exists' });
        }
    }

    if ((role === 'Faculty' || role === 'Student') && !subRole) {
        return res.status(400).json({ message: 'subRole (department) is required' });
    }

    const newUser = UserFactory.create({
        username,
        id,
        password,
        role,
        subRole,
        batch,
    });

    try {
        await newUser.save();
        res.json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user', error: err });
    }
}

const login = async (req, res) => {
    const { id, password } = req.body;
    // Find user by ID (Case Insensitive)
    const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });

    if (user && user.password === password) {
        res.json({ message: 'Login successful!', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials!' });
    }
}

module.exports = { register, login };