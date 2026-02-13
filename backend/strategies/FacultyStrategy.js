const DefaultStrategy = require('./DefaultStrategy');
class FacultyStrategy extends DefaultStrategy {
    constructor(subRole) {
        super('Faculty', subRole);
    }
    // Override the fetch logic
    async fetchAnnouncements(userId) {
        let orConditions = [
            { targetAudience: { $elemMatch: { role: 'All' } } },
            { targetAudience: { $elemMatch: { role: 'Faculty', subRole: null } } } // 'All' depts = null
        ];
        // Specific Dept logic
        if (this.subRole) {
            orConditions.push({
                targetAudience: { $elemMatch: { role: 'Faculty', subRole: this.subRole } }
            });
        }

        // Also show my own uploads
        if (userId) {
            const User = require('../models/User'); // Lazy import to avoid circular dependency issues if any
            const user = await User.findOne({ id: userId });
            if (user) orConditions.push({ 'uploadedBy': user._id });
        }

        return await this._executeQuery(orConditions);
    }
}
module.exports = FacultyStrategy;
