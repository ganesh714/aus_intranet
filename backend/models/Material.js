const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    targetBatch: { type: String, required: true },
    targetDepartments: { type: [String], required: true },

    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);