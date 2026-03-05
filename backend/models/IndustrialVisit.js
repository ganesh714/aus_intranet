const mongoose = require('mongoose');

const industrialVisitSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userRole: { type: String, default: 'Faculty' },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole', required: true },
    userName: { type: String },

    academicYear: { type: String, required: true },
    semester: { type: String, required: true },
    classSection: { type: String, required: true },
    industryName: { type: String, required: true },
    placeOfVisit: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    studentCount: { type: Number, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IndustrialVisit', industrialVisitSchema);
