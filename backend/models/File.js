// models/Files.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    // --- Physical File Details ---
    fileName: { type: String, required: true },
    filePath: { type: String, required: true, unique: true }, // e.g., "uploads/12345.pdf"
    fileType: { type: String }, // e.g., "application/pdf"
    fileSize: { type: Number },

    // --- Ownership ---
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // --- Usage Contexts (The "Where is it used?" flags) ---
    usage: {
        isPersonal: { type: Boolean, default: false },     // Visible in "My Data"
        isAnnouncement: { type: Boolean, default: false }, // Linked to an Announcement
        isAchievement: { type: Boolean, default: false },  // Linked to an Achievement
        isDeptDocument: { type: Boolean, default: false }  // Linked to a Dept/Course Document
    },

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);