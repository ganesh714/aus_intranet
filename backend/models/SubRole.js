const mongoose = require('mongoose');

const subRoleSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Computer Science and Engineering"

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    }, // e.g., "AIML", "REG" (Useful for generating IDs)

    displayName: { type: String, required: true }, // e.g., "CSE", "Registrar"... to display in UI
    allowedRoles: [{
        type: String,
        enum: ['Student', 'Faculty', 'HOD', 'Asso.Dean', 'Dean', 'Officers']
    }],

    // Special features/permissions attached to this department
    specialFeatures: [{
        type: String,
        enum: ['MANAGE_IQAC'], // Add more here as needed, e.g. 'MANAGE_FINANCE'
    }]
});

module.exports = mongoose.model('SubRole', subRoleSchema);
