// models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    // UPDATED: Reference the 'File' model
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },

    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: [{
        role: { type: String, required: true },
        subRole: { type: String },
        batch: { type: String } // Added batch field
    }]
});

module.exports = mongoose.model('Announcement', announcementSchema);