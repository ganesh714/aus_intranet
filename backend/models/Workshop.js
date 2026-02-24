const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userRole: { type: String, default: 'Faculty' },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole', required: true },
    userName: { type: String },

    academicYear: { type: String, required: true },
    activityName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coordinators: { type: String, required: true },
    professionalBody: { type: String },
    studentCount: { type: Number, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workshop', workshopSchema);
