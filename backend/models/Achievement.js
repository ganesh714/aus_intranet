// backend/models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String , required: true }, // e.g., 'Publication', 'Award'
    description: { type: String },
    date: { type: Date },
    proofFile: { type: String }, // Path to the uploaded PDF/Image
    status: { 
        type: String, 
        enum: ['Pending', 'Verified', 'Rejected'], 
        default: 'Pending' 
    },
    department: { type: String, required: true }, // e.g., 'CSE'
    contributor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, // Links back to the Faculty/HOD who uploaded it
});

module.exports = mongoose.model('Achievement', achievementSchema);