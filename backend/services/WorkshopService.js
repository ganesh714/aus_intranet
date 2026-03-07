const Workshop = require('../models/Workshop');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose');

class WorkshopService {

    // Resolve dept string/code to an ObjectId
    static async resolveDeptId(dept) {
        if (!dept || dept === 'All') return null;

        if (mongoose.Types.ObjectId.isValid(dept)) return dept;

        const subRoleDoc = await SubRole.findOne({
            $or: [{ code: dept }, { displayName: dept }, { name: dept }]
        });
        return subRoleDoc ? subRoleDoc._id : null;
    }

    // Add Workshop
    static async addWorkshop(userId, data) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const newWorkshop = new Workshop({
            userId,
            userName: user.username,
            dept: user.subRole,
            userRole: user.role,
            ...data
        });

        return await newWorkshop.save();
    }

    // Get Workshops with filters
    static async getWorkshops({ userId, dept, academicYear }) {
        let filter = {};

        if (userId) filter.userId = userId;

        if (dept && dept !== 'All') {
            const resolvedId = await WorkshopService.resolveDeptId(dept);
            if (!resolvedId) return [];
            filter.dept = resolvedId;
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        return await Workshop.find(filter).populate('dept').sort({ createdAt: -1 });
    }

    // Delete Workshop
    static async deleteWorkshop(id) {
        return await Workshop.findByIdAndDelete(id);
    }

    // Update Workshop
    static async updateWorkshop(id, data) {
        return await Workshop.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = WorkshopService;
