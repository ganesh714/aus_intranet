const mongoose = require('mongoose');

const schoolProgramSchema = new mongoose.Schema({
    school: { 
        type: String, 
        required: true 
    }, // e.g., "School of Engineering"
    level: { 
        type: String, 
        required: true, 
        enum: ['UG', 'PG'] 
    }, // 'UG' or 'PG'
    program: { 
        type: String, 
        required: true 
    }, // e.g., "B.Tech", "MBA"
    duration: { 
        type: Number, 
        required: true 
    }, // Duration in years, e.g., 4 or 2
    departments: [{
        name: { 
            type: String, 
            required: true 
        }, // Display name of the department/branch
        subRoleRef: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'SubRole', 
            default: null 
        } // Optional link to an existing SubRole (relevant for B.Tech)
    }]
});

module.exports = mongoose.model('SchoolProgram', schoolProgramSchema);
