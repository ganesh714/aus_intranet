const Workshop = require('../models/Workshop');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose'); // [NEW]

// Add Workshop
const addWorkshop = async (req, res) => {
    try {
        const { userId, ...data } = req.body;

        // Fetch User details for dept/name context
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newWorkshop = new Workshop({
            userId,
            userName: user.username,
            dept: user.subRole, // Assumes user.subRole is ObjectId from User model
            userRole: user.role,
            ...data
        });

        await newWorkshop.save();
        res.status(201).json({ message: 'Workshop added successfully', workshop: newWorkshop });
    } catch (error) {
        console.error("Error adding workshop:", error);
        res.status(500).json({ message: 'Error adding workshop' });
    }
};

// Get Workshops
const getWorkshops = async (req, res) => {
    try {
        const { userId, dept, academicYear } = req.query;
        let filter = {};

        if (userId) filter.userId = userId;
        if (userId) filter.userId = userId;

        // [OPTIMIZATION] Resolve dept string to ObjectId
        if (dept && dept !== 'All') {
            if (mongoose.Types.ObjectId.isValid(dept)) {
                // Already an ID
                filter.dept = dept;
            } else {
                const subRoleDoc = await SubRole.findOne({
                    $or: [{ code: dept }, { displayName: dept }, { name: dept }]
                });
                if (subRoleDoc) {
                    filter.dept = subRoleDoc._id;
                } else {
                    return res.json({ workshops: [] });
                }
            }
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        const workshops = await Workshop.find(filter).sort({ createdAt: -1 });
        res.json({ workshops });
    } catch (error) {
        console.error("Error fetching workshops:", error);
        res.status(500).json({ message: 'Error fetching workshops' });
    }
};

// Delete Workshop
const deleteWorkshop = async (req, res) => {
    try {
        await Workshop.findByIdAndDelete(req.params.id);
        res.json({ message: 'Workshop deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workshop' });
    }
};

// Update Workshop
const updateWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Workshop.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ message: 'Workshop updated', workshop: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating workshop' });
    }
};

module.exports = {
    addWorkshop,
    getWorkshops,
    deleteWorkshop,
    updateWorkshop
};
