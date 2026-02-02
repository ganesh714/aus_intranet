const UserService = require('../services/UserService');

// 1. Get Users
const getUsers = async (req, res) => {
    try {
        const users = await UserService.getUsers(req.query);
        res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// 2. Get Dept Faculty
const getDeptFaculty = async (req, res) => {
    try {
        const faculty = await UserService.getDeptFaculty(req.query.dept);
        res.json({ faculty });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculty', error: error.message });
    }
};

// 3. Toggle Permission
const toggleTimetablePermission = async (req, res) => {
    try {
        const { id, canUpload } = req.body;
        const savedUser = await UserService.toggleTimetablePermission(id, canUpload);
        res.json({ message: 'Permission updated', user: savedUser });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 :
            error.message.includes('Permissions') ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

// [NEW] Toggle Achievement Permission
const toggleAchievementPermission = async (req, res) => {
    try {
        const { id, permissionType, allowed } = req.body;
        // Validate type
        if (!['approveStudentAchievements', 'approveFacultyAchievements'].includes(permissionType)) {
            return res.status(400).json({ message: "Invalid permission type" });
        }

        const savedUser = await UserService.toggleAchievementPermission(id, permissionType, allowed);
        res.json({ message: 'Permission updated', permissions: savedUser.permissions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Change Password
const changePassword = async (req, res) => {
    try {
        const { id, currentPassword, newPassword } = req.body;
        await UserService.changePassword(id, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully!' });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};



// ... existing code ...

const togglePinTimetable = async (req, res) => {
    try {
        const { userId, timetableId } = req.body;
        const result = await UserService.togglePin(userId, timetableId);
        res.json(result);
    } catch (error) {
        console.error("Error toggling pin:", error);
        res.status(500).json({ message: "Error updating pin", error: error.message });
    }
};

const getPinnedTimetables = async (req, res) => {
    try {
        const pinned = await UserService.getPinnedTimetables(req.query.userId);
        res.json({ pinned });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pinned timetables" });
    }
};

const resetPassword = async (req, res) => {
    try {
        await UserService.resetPasswordRequest(req.body.id);
        res.json({ message: 'Password reset processed. If the ID is valid, an email will be sent.' });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
};

module.exports = {
    getUsers,
    getDeptFaculty,
    toggleTimetablePermission,
    toggleAchievementPermission, // [NEW]
    changePassword,
    togglePinTimetable,
    getPinnedTimetables,
    resetPassword
};
