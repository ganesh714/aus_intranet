const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    batch: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
