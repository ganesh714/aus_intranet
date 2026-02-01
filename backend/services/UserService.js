const User = require('../models/User');
const SubRole = require('../models/SubRole'); // [NEW]
const randomstring = require('randomstring');
const authEmitter = require('../events/AuthEvents');

class UserService {

    // 1. Get Users with Filters
    static async getUsers({ role, dept, batch, search }) {
        let query = {};
        if (role) query.role = role;
        if (dept && dept !== 'All') query.subRole = dept;
        if (batch) query.batch = batch; // Only for students
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        // Return minimal info and transform subRole for frontend
        const users = await User.find(query).select('id username role subRole batch').populate('subRole');
        return users.map(user => {
            const u = user.toObject();
            if (u.subRole && typeof u.subRole === 'object') {
                u.subRoleId = u.subRole._id;
                u.subRole = u.subRole.displayName || u.subRole.code;
            }
            return u;
        });
    }

    // 2. Get Department Faculty
    // 2. Get Department Faculty
    static async getDeptFaculty(dept) {
        // [NEW] Resolve dept string to ObjectId
        let subRoleId = null;
        if (dept) {
            const subRoleDoc = await SubRole.findOne({
                $or: [
                    { code: { $regex: new RegExp("^" + dept + "$", "i") } },
                    { name: { $regex: new RegExp("^" + dept + "$", "i") } },
                    { displayName: { $regex: new RegExp("^" + dept + "$", "i") } }
                ]
            });
            if (subRoleDoc) subRoleId = subRoleDoc._id;
        }

        if (!subRoleId && dept !== 'All') {
            // If dept provided but not found, return empty or handle error
            // For now, let's return [] to avoid CastError
            return [];
        }

        const query = { role: 'Faculty' };
        if (subRoleId) query.subRole = subRoleId;

        return await User.find(query, 'username id canUploadTimetable');
    }

    // 3. Toggle Timetable Permission (Faculty Only)
    static async toggleTimetablePermission(id, canUpload) {
        const user = await User.findOne({ id });
        if (!user) throw new Error('User not found');
        if (user.role !== 'Faculty') throw new Error('Permissions can only be toggled for Faculty.');

        user.canUploadTimetable = canUpload;
        return await user.save();
    }

    // 4. Change Password
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        // Plaintext comparison as per existing (legacy) logic
        // TODO: Hash passwords
        if (user.password !== currentPassword) {
            throw new Error('Incorrect current password');
        }

        user.password = newPassword;
        return await user.save();
    }

    static async togglePin(userId, timetableId) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error("User not found");

        if (!user.pinnedTimetables) user.pinnedTimetables = [];

        const isPinned = user.pinnedTimetables.some(id => id.toString() === timetableId);
        let pinnedStatus = false;

        if (isPinned) {
            user.pinnedTimetables = user.pinnedTimetables.filter(id => id.toString() !== timetableId);
            pinnedStatus = false;
        } else {
            if (user.pinnedTimetables.length >= 3) {
                throw new Error("You can only pin up to 3 timetables.");
            }
            user.pinnedTimetables.push(timetableId);
            pinnedStatus = true;
        }

        await user.save();
        return { message: pinnedStatus ? "Pinned" : "Unpinned", pinned: pinnedStatus };
    }

    static async getPinnedTimetables(userId) {
        const user = await User.findOne({ id: userId }).populate({
            path: 'pinnedTimetables',
            populate: [
                { path: 'uploadedBy', select: 'username' },
                { path: 'fileId' }
            ]
        });

        if (!user) throw new Error("User not found");
        return user.pinnedTimetables || [];
    }

    static async resetPasswordRequest(id) {
        const user = await User.findOne({ id });
        if (!user) throw new Error('User not found!');

        const newPassword = randomstring.generate({ length: 8, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
        user.password = newPassword;
        await user.save();

        authEmitter.emit('passwordReset', { email: id, newPassword });
        return true;
    }
}

module.exports = UserService;
