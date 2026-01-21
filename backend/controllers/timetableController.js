const Timetable = require('../models/Timetable');
const User = require('../models/User');
const storageService = require('../services/storageService');
const TimetableService = require('../services/TimetableService');
const addTimetable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // User is ALREADY attached by Middleware!

        if (year) query.targetYear = year;
        if (section) query.targetSection = section;

        const timetables = await Timetable.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role subRole id')
            .sort({ uploadedAt: -1 });

        res.json({ timetables });

    } catch (error) {
        console.error("Error fetching timetables:", error);
        res.status(500).json({ message: "Error fetching timetables", error });
    }
};

module.exports = {
    addTimetable,
    getTimetables
};
