// models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    // Common
    title: { type: String }, // Optional, as some types use other fields like certificationName
    type: { type: String, required: true },
    description: { type: String },
    date: { type: Date },

    // Status & Approval
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: { type: String }, // Name of approver
    approverId: { type: String }, // ID of approver
    approverRole: { type: String }, // Role of approver

    // User Link
    userId: { type: String, required: true }, // Store the unique user ID (e.g., Roll No or Faculty ID)
    userRole: { type: String, required: true },
    userName: { type: String }, // Store snapshot of name for easier display
    dept: { type: String }, // Department context for filtering (e.g. 'CSE')

    // File Link
    proofFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    proof: { type: String }, // Store filename for quick access/display

    // --- Dynamic Fields (Student & Faculty) ---
    certificationName: { type: String }, // Missing field
    issuingBody: { type: String },
    certificateId: { type: String },
    score: { type: String },
    duration: { type: String },

    companyName: { type: String },
    jobProfile: { type: String },
    package: { type: String },
    location: { type: String },
    offerType: { type: String },

    eventName: { type: String },
    organizer: { type: String },
    rank: { type: String },

    activityName: { type: String },
    role: { type: String }, // e.g. Team Lead, Participant, Resource Person
    activityType: { type: String },

    // Faculty Specific
    journalName: { type: String },
    indexing: { type: String },
    volume: { type: String },
    isbn: { type: String }, // ISBN/ISSN

    conferenceName: { type: String },

    ipType: { type: String },
    appNumber: { type: String },

    programName: { type: String },
    studentsTrained: { type: Number },
    certBody: { type: String },

    publisher: { type: String },
    projectName: { type: String },
    partner: { type: String },
});

module.exports = mongoose.model('Achievement', achievementSchema);