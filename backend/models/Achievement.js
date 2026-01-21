// models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: { type: String }, // Optional
    type: { type: String, required: true }, // Type is still required for logic
    description: { type: String },
    date: { type: Date },

    // UPDATED: Reference the 'File' model
    proofFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: { type: String },
    department: { type: String, required: true }, // Keep dept required for HOD filtering
    contributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = mongoose.model('Achievement', achievementSchema);