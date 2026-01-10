const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },

    // New Rule-Based Targeting
    targetAudience: [{
        role: { type: String, required: true }, // 'Student' or 'Faculty'
        subRole: { type: String }, // e.g. 'CSE', 'ECE' (Optional - if missing, applies to all depts)
        batch: { type: String }    // e.g. '2024-2028' (Optional - only for Students)
    }],

    targetIndividualIds: { type: [String], default: [] }, // Specific overrides

    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);