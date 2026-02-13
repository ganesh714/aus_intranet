const SubRole = require('../models/SubRole');

// Get all subroles
exports.getAllSubRoles = async (req, res) => {
    try {
        const subRoles = await SubRole.find({});
        res.status(200).json({ success: true, subRoles });
    } catch (error) {
        console.error('Error fetching subroles:', error);
        res.status(500).json({ success: false, message: 'Server error fetching subroles' });
    }
};

// Add a new subrole
exports.createSubRole = async (req, res) => {
    try {
        const { name, code, displayName, allowedRoles } = req.body;

        const existing = await SubRole.findOne({ code });
        if (existing) {
            return res.status(400).json({ success: false, message: 'SubRole with this code already exists' });
        }

        const newSubRole = new SubRole({
            name,
            code,
            displayName,
            allowedRoles
        });

        await newSubRole.save();
        res.status(201).json({ success: true, message: 'SubRole created successfully', subRole: newSubRole });
    } catch (error) {
        console.error('Error creating subrole:', error);
        res.status(500).json({ success: false, message: 'Server error creating subrole' });
    }
};

// Delete a subrole
exports.deleteSubRole = async (req, res) => {
    try {
        const { id } = req.params;
        await SubRole.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'SubRole deleted successfully' });
    } catch (error) {
        console.error('Error deleting subrole:', error);
        res.status(500).json({ success: false, message: 'Server error deleting subrole' });
    }
};

// Get subroles filtered by parent role
exports.getSubRolesByRole = async (req, res) => {
    try {
        const { role } = req.params;
        // Find subroles where 'allowedRoles' array contains the requested role
        const subRoles = await SubRole.find({ allowedRoles: role });
        res.status(200).json({ success: true, subRoles });
    } catch (error) {
        console.error('Error fetching specific subroles:', error);
        res.status(500).json({ success: false, message: 'Server error fetching specific subroles' });
    }
};
