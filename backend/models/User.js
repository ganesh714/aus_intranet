const mongoose = require('mongoose');

// Define the schema for the user, including subRole that is only required for specific roles
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Permission flag specifically for Faculty
    // For HODs, this is effectively 'true' by virtue of their role.
    canUploadTimetable: { type: Boolean, default: false },
    role: {
        type: String,
        required: true,
        enum: ['Student', 'Officers', 'Dean', 'Asso.Dean', 'HOD', 'Faculty', 'Admin']
    },
    subRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubRole',
        default: null,  // subRole can be null if it's not relevant for the role
    },
    batch: {
        type: String,
        required: function () {
            return this.role === 'Student';
        }
    },
    pinnedTimetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' }]
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
