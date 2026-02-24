// backend/controllers/authController.js

const User = require('../models/User');
const SubRole = require('../models/SubRole'); // [NEW] Import SubRole
const UserFactory = require('../factories/UserFactory');

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    const { username, id, password, role, subRole, batch } = req.body;

    // Check for existing user (Case Insensitive)
    const existingUserById = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
    if (existingUserById) {
        return res.status(400).json({ message: 'User ID already exists' });
    }

    // [Moved & Fixed] Resolve subRole if provided
    let subRoleObjId = null;
    if (subRole) {
        // Try to find by displayName, name, or code (case insensitive)
        const subRoleDoc = await SubRole.findOne({
            $or: [
                { displayName: { $regex: new RegExp("^" + subRole + "$", "i") } },
                { name: { $regex: new RegExp("^" + subRole + "$", "i") } },
                { code: { $regex: new RegExp("^" + subRole + "$", "i") } }
            ]
        });

        if (subRoleDoc) {
            subRoleObjId = subRoleDoc._id;
        } else if (role === 'Faculty' || role === 'Student') {
            return res.status(400).json({ message: 'Invalid subRole: ' + subRole });
        }
    }

    if ((role === 'Faculty' || role === 'Student') && !subRoleObjId) {
        return res.status(400).json({ message: 'subRole (department) is required and must be valid' });
    }

    // [Moved & Updated] Check for existing user by Role/SubRole
    // Using subRoleObjId which is now an ObjectId (or null)
    if (role !== 'Faculty' && role !== 'Admin' && role !== 'Student') {
        const existingUserByRoleAndSubRole = await User.findOne({ role, subRole: subRoleObjId });
        if (existingUserByRoleAndSubRole) {
            return res.status(400).json({ message: 'User with this role and subRole already exists' });
        }
    }

    const newUser = UserFactory.create({
        username,
        id,
        password,
        role,
        subRole: subRoleObjId, // Pass the ObjectId
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

    // Find user by ID (Case Insensitive) and populate subRole
    //const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } }).populate('subRole');

    // Find user by ID (Case Insensitive)
    console.log("DB NAME:", mongoose.connection.name);
    console.log(User.collection.name);


    const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
    console.log(user);
    if (user && user.password === password) {
        // Transform for frontend compatibility
        const userObj = user.toObject();
        if (userObj.subRole && typeof userObj.subRole === 'object') {
            userObj.subRoleId = userObj.subRole._id; // New Field for ID reference
            userObj.subRole = userObj.subRole.displayName || userObj.subRole.code; // Maintain string for Frontend
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({ message: 'Login successful!', user: userObj, token });
    } else {
        res.status(401).json({ message: 'Invalid credentials!' });
    }
}

const updateUsername = async (req, res) => {
    const { id, newUsername } = req.body;
    try {
        // Case-insensitive ID lookup
        const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = newUsername;
        await user.save();

        res.json({ message: 'Username updated successfully!', username: user.username });
    } catch (err) {
        console.error("Error updating username:", err);
        res.status(500).json({ message: 'Error updating username', error: err.message });
    }
}

module.exports = { register, login, updateUsername };