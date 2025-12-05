const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    filePath: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
        username: { type: String, required: true },
        role: { type: String, required: true },
        subRole: { type: String },
    },
});

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;