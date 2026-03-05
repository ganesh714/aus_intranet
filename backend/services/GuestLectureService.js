const GuestLecture = require('../models/GuestLecture');
const User = require('../models/User');
const SubRole = require('../models/SubRole');
const mongoose = require('mongoose');

class GuestLectureService {

    // Resolve dept string/code to an ObjectId
    static async resolveDeptId(dept) {
        if (!dept || dept === 'All') return null;

        if (mongoose.Types.ObjectId.isValid(dept)) return dept;

        const subRoleDoc = await SubRole.findOne({
            $or: [{ code: dept }, { displayName: dept }, { name: dept }]
        });
        return subRoleDoc ? subRoleDoc._id : null;
    }

    // Add Guest Lecture
    static async addLecture(userId, data) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const newLecture = new GuestLecture({
            userId,
            userName: user.username,
            dept: user.subRole,
            userRole: user.role,
            ...data
        });

        return await newLecture.save();
    }

    // Get Guest Lectures with filters
    static async getLectures({ userId, dept, academicYear }) {
        let filter = {};

        if (userId) filter.userId = userId;

        if (dept && dept !== 'All') {
            const resolvedId = await GuestLectureService.resolveDeptId(dept);
            if (!resolvedId) return [];
            filter.dept = resolvedId;
        }

        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;

        return await GuestLecture.find(filter).sort({ createdAt: -1 });
    }

    // Delete Guest Lecture
    static async deleteLecture(id) {
        return await GuestLecture.findByIdAndDelete(id);
    }

    // Update Guest Lecture
    static async updateLecture(id, data) {
        return await GuestLecture.findByIdAndUpdate(id, data, { new: true });
    }
}

module.exports = GuestLectureService;
