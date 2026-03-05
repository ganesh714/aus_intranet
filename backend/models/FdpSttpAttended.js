const mongoose = require('mongoose');

const fdpSttpAttendedSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userRole: { type: String, default: 'Faculty' },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole', required: true },
    userName: { type: String },

    facultyName: { type: String, required: true },
    academicYear: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, required: true },
    organizedBy: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FdpSttpAttended', fdpSttpAttendedSchema);
