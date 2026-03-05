const FdpPdpOrganized = require('../models/FdpPdpOrganized');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose');

class FdpPdpOrganizedService {

    // Resolve dept string/code to an ObjectId
    static async resolveDeptId(dept) {
        if (!dept || dept === 'All') return null;

        if (mongoose.Types.ObjectId.isValid(dept)) return dept;

        const subRoleDoc = await SubRole.findOne({
            $or: [{ code: dept }, { displayName: dept }, { name: dept }]
        });
        return subRoleDoc ? subRoleDoc._id : null;
    }

    // Add FDP/PDP Organized
    static async addFdpPdp(userId, data) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const newFdpPdp = new FdpPdpOrganized({
            userId,
            userName: user.username,
            dept: user.subRole,
            userRole: user.role,
            ...data
        });

        return await newFdpPdp.save();
    }

    // Get FDP/PDP Organized with filters
    static async getFdpPdps({ userId, dept, academicYear }) {
        let filter = {};

        if (userId) filter.userId = userId;

        if (dept && dept !== 'All') {
            const resolvedId = await FdpPdpOrganizedService.resolveDeptId(dept);
            if (!resolvedId) return [];
            filter.dept = resolvedId;
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        return await FdpPdpOrganized.find(filter).sort({ createdAt: -1 });
    }

    // Delete FDP/PDP Organized
    static async deleteFdpPdp(id) {
        return await FdpPdpOrganized.findByIdAndDelete(id);
    }

    // Update FDP/PDP Organized
    static async updateFdpPdp(id, data) {
        return await FdpPdpOrganized.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = FdpPdpOrganizedService;
