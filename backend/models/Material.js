const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    targetYear: { type: Number, required: true },
    targetSection: { type: Number, required: true },
    
    fileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'File',
        required: true 
    },

    uploadedBy: {
        username: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
        subRole: { type: String }
    },
    
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);