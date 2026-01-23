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
            // 1. Core General Matches (Must NOT have a specific batch)
            // Logic: If role=Student & subRole=All, but batch is unspecified (null/exists:false)
            {
                role: 'Student',
                subRole: 'All',
                $or: [{ batch: { $exists: false } }, { batch: null }, { batch: '' }]
            },
            // 2. Dept General Matches (Must NOT have a specific batch)
            {
                role: 'Student',
                subRole: this.subRole,
                $or: [{ batch: { $exists: false } }, { batch: null }, { batch: '' }]
            }
        ];

        if (this.batch) {
            // 3. Dept + Batch Match
            criteria.push({ role: 'Student', subRole: this.subRole, batch: this.batch });
            // 4. All + Batch Match
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
