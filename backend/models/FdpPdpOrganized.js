const mongoose = require('mongoose');

const fdpPdpOrganizedSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userRole: { type: String, default: 'Faculty' },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole', required: true },
    userName: { type: String },

    academicYear: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    resourcePerson: { type: String, required: true },
    participantCount: { type: Number, required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FdpPdpOrganized', fdpPdpOrganizedSchema);
