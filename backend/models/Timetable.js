const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    targetYear: { type: Number, required: true },
    targetSection: { type: Number, required: true },

    // [NEW] Dynamic Fields
    subRole: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole', required: true },
    batch: { type: String, default: null }, // Optional, for students

    // Reference to the physical file
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },

    // Reference to the User who uploaded it
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', timetableSchema);
