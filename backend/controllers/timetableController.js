const TimetableService = require('../services/TimetableService');
const User = require('../models/User');

const addTimetable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // We still need to parse the user from the "stringified" body 
        // (This is a legacy quirk we will fix in Security lesson)
        let user;
        try {
            user = JSON.parse(req.body.user);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid user data' });
        }
        // Additional fields
        const { subRole, batch } = req.body;
        // Fetch full user object to be safe (optional but recommended)
        const dbUser = await User.findById(user._id);
        // DELEGATE to Service
        const result = await TimetableService.addTimetable(dbUser, req.file, subRole, batch);
        res.status(200).json({
            message: 'Timetable uploaded successfully',
            timetable: result
        });
    } catch (error) {
        console.error("Timetable Controller Error:", error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};
module.exports = { addTimetable };
