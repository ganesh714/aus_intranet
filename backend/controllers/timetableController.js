const TimetableService = require('../services/TimetableService');
const addTimetable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // User is ALREADY attached by Middleware!
        const user = req.user;
        // Additional fields
        const { subRole, batch } = req.body;
        // DELEGATE to Service
        const result = await TimetableService.addTimetable(user, req.file, subRole, batch);
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
