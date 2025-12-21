// models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String , required: true }, 
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
        enum: ['Pending', 'Verified', 'Rejected'], 
        default: 'Pending' 
    },
    department: { type: String, required: true }, 
    contributor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, 
});

module.exports = mongoose.model('Achievement', achievementSchema);