const DefaultStrategy = require('./DefaultStrategy');
class StudentStrategy extends DefaultStrategy {
    constructor(subRole, batch) {
        super('Student', subRole);
        this.batch = batch;
    }
    async fetchAnnouncements(userId) {
        // Complex Student Logic
        // 1. All
        // 2. Student + All Depts
        // 3. Student + My Dept
        // 4. Student + My Dept + My Batch

        const criteria = [
            { role: 'Student', subRole: 'All' },
            { role: 'Student', subRole: this.subRole } // General Dept announcements
        ];
        if (this.batch) {
            criteria.push({ role: 'Student', subRole: this.subRole, batch: this.batch });
            criteria.push({ role: 'Student', subRole: 'All', batch: this.batch });
        }
        // Logic for "Batch exists or matches" is tricky in Mongo, 
        // to simplify for this lesson, we will match exact criteria pushed above.

        const orConditions = [
            { targetAudience: { $elemMatch: { role: 'All' } } },
            { targetAudience: { $elemMatch: { $or: criteria } } }
        ];

        // Also show my own uploads
        if (userId) {
            const User = require('../models/User');
            const user = await User.findOne({ id: userId });
            if (user) orConditions.push({ 'uploadedBy': user._id });
        }

        return await this._executeQuery(orConditions);
    }
}
module.exports = StudentStrategy;
