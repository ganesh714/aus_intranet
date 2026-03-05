const IndustrialVisit = require('../models/IndustrialVisit');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose');

class IndustrialVisitService {

    // Resolve dept string/code to an ObjectId
    static async resolveDeptId(dept) {
        if (!dept || dept === 'All') return null;

        if (mongoose.Types.ObjectId.isValid(dept)) return dept;

        const subRoleDoc = await SubRole.findOne({
            $or: [{ code: dept }, { displayName: dept }, { name: dept }]
        });
        return subRoleDoc ? subRoleDoc._id : null;
    }

    // Add Industrial Visit
    static async addVisit(userId, data) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const newVisit = new IndustrialVisit({
            userId,
            userName: user.username,
            dept: user.subRole,
            userRole: user.role,
            ...data
        });

        return await newVisit.save();
    }

    // Get Industrial Visits with filters
    static async getVisits({ userId, dept, academicYear }) {
        let filter = {};

        if (userId) filter.userId = userId;

        if (dept && dept !== 'All') {
            const resolvedId = await IndustrialVisitService.resolveDeptId(dept);
            if (!resolvedId) return [];
            filter.dept = resolvedId;
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        return await IndustrialVisit.find(filter).sort({ createdAt: -1 });
    }

    // Delete Industrial Visit
    static async deleteVisit(id) {
        return await IndustrialVisit.findByIdAndDelete(id);
    }

    // Update Industrial Visit
    static async updateVisit(id, data) {
        return await IndustrialVisit.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = IndustrialVisitService;
