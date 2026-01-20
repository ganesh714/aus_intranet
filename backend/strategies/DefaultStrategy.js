
const Announcement = require('../models/Announcement');
const User = require('../models/User');

class DefaultStrategy {
    constructor(role, subRole) {
        this.role = role;
        this.subRole = subRole;
    }

    async fetchAnnouncements(userId) {
        // Base logic: Fetch for My Role + 'All'
        const orConditions = [
            { targetAudience: { $elemMatch: { role: 'All' } } } // Everyone sees 'All'
        ];

        if (this.role) {
            orConditions.push({ targetAudience: { $elemMatch: { role: this.role } } });
        }

        // Also show my own uploads
        if (userId) {
            const user = await User.findOne({ id: userId });
            if (user) orConditions.push({ 'uploadedBy': user._id });
        }
        return await this._executeQuery(orConditions);
    }

    async _executeQuery(orConditions) {
        if (orConditions.length === 0) return [];
        return await Announcement.find({ $or: orConditions })
            .populate('fileId')
            .populate('uploadedBy', 'username role id')
            .sort({ uploadedAt: -1 });
    }
}

module.exports = DefaultStrategy;
