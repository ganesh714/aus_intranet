const FdpSttpAttended = require('../models/FdpSttpAttended');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose');

class FdpSttpAttendedService {

    // Resolve dept string/code to an ObjectId
    static async resolveDeptId(dept) {
        if (!dept || dept === 'All') return null;

        if (mongoose.Types.ObjectId.isValid(dept)) return dept;

        const subRoleDoc = await SubRole.findOne({
            $or: [{ code: dept }, { displayName: dept }, { name: dept }]
        });
        return subRoleDoc ? subRoleDoc._id : null;
    }

    // Add FDP/STTP Attended
    static async addFdpSttp(userId, data) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        // Default facultyName to username if not explicitly provided
        const facultyName = data.facultyName || user.username;

        const newFdpSttp = new FdpSttpAttended({
            userId,
            userName: user.username,
            dept: user.subRole,
            userRole: user.role,
            facultyName,
            ...data
        });

        return await newFdpSttp.save();
    }

    // Get FDP/STTP Attended with filters
    static async getFdpSttps({ userId, dept, academicYear }) {
        let filter = {};

        if (userId) filter.userId = userId;

        if (dept && dept !== 'All') {
            const resolvedId = await FdpSttpAttendedService.resolveDeptId(dept);
            if (!resolvedId) return [];
            filter.dept = resolvedId;
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        return await FdpSttpAttended.find(filter).sort({ createdAt: -1 });
    }

    // Delete FDP/STTP Attended
    static async deleteFdpSttp(id) {
        return await FdpSttpAttended.findByIdAndDelete(id);
    }

    // Update FDP/STTP Attended
    static async updateFdpSttp(id, data) {
        return await FdpSttpAttended.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = FdpSttpAttendedService;
