const mongoose = require('mongoose');

// Define the schema for the user, including subRole that is only required for specific roles
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Leadership', 'Dean','Asso.Dean', 'HOD', 'Faculty', 'Admin'] // 'Officers' - > 'Leadership' 
    },
    subRole: {
        type: String,
        enum: [
            'DyPC', 'VC', 'ProVC', 'Registrar',  // sub-roles for Leadership
            'IQAC', 'R&D', 'CLM', 'CD',          // sub-roles for Dean
            'SOE', 'IQAC', 'ADMIN',       // sub-roles for Asso.Dean
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE','ECE', 'Ag.E', 'MPE', 'FED', // sub-roles
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', // sub-roles for HOD
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE' // sub-roles for Faculty
        ],
        default: null,  // subRole can be null if it's not relevant for the role
        validate: {
            validator: function (v) {
                // If the role is 'Leadership', subRole must be one of 'DyPC', 'VC', etc.
                if (this.role === 'Leadership' && !['DyPC', 'VC', 'ProVC', 'Registrar'].includes(v)) {
                    return false;
                }
                // If the role is 'Dean', subRole must be one of 'IQAC', 'R&D', etc.
                if (this.role === 'Dean' && !['IQAC', 'R&D', 'CLM', 'CD'].includes(v)) {
                    return false;
                }

                // If the role is 'Dean', subRole must be one of 'IQAC', 'R&D', etc.
                if (this.role === 'Asso.Dean' && !['SOE', 'IQAC', 'ADMIN'].includes(v)) {
                    return false;
                }

                // If the role is 'HOD' or 'Faculty', subRole must be one of 'IT', 'CSE', etc.
                if ((this.role === 'HOD' || this.role === 'Faculty') && !['IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE'].includes(v)) {
                    return false;
                }
                // If role is 'Admin', subRole should be null or not set
                if (this.role === 'Admin' && v !== null) {
                    return false;
                }
                
                // If subRole is not provided and it's not needed for the role (e.g., Admin), it should be valid
                return true;
            },
            message: 'Invalid subRole for the given role'
        }
    },
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
