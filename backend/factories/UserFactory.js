const User = require('../models/User');

class UserFactory {
    static create(data) {
        const { username, id, password, role, subRole, batch } = data;
        const normalizedId = id.toUpperCase();

        const finalSubRole = role === 'Admin' ? null : subRole;
        const finalBatch = role === 'Student' ? batch : null;

        return new User({
            username,
            id: normalizedId,
            password,
            role,
            subRole: finalSubRole,
            batch: finalBatch,
            canUploadTimetable: false
        });
    }
}

module.exports = UserFactory;