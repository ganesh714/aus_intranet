const Timetable = require('../models/Timetable');
const User = require('../models/User');
const SubRole = require('../models/SubRole'); // [NEW]
const storageService = require('../services/storageService');
const TimetableService = require('../services/TimetableService');

const addTimetable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // User is attached by Middleware (req.user) if using 'protect', 
        // but typically Multer runs before protect? 
        // Wait, route is: upload.single -> protect -> controller.
        // So req.user is available.
        // However, original logic might have parsed 'req.body.user'?
        // Let's rely on req.user from authMiddleware if available, or fallback.
        // But the previous implementation used `req.user`.

        const user = req.user;
        if (!user) return res.status(401).json({ message: "User not authenticated" });

        const { subRole, batch } = req.body;

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

const getTimetables = async (req, res) => {
    const { role, subRole, year, section } = req.query;

    try {
        let query = {};
        if (subRole && subRole !== 'All' && subRole !== 'null') {
            // [NEW] Resolve subRole string to ObjectId
            let subRoleId = null;
            const subRoleDoc = await SubRole.findOne({
                $or: [
                    { code: { $regex: new RegExp("^" + subRole + "$", "i") } },
                    { name: { $regex: new RegExp("^" + subRole + "$", "i") } },
                    { displayName: { $regex: new RegExp("^" + subRole + "$", "i") } }
                ]
            });

            if (subRoleDoc) {
                subRoleId = subRoleDoc._id;
            } else {
                return res.json({ timetables: [] }); // If subrole not found, no users, no timetables
            }

            const users = await User.find({ subRole: subRoleId }).select('_id');
            const userIds = users.map(u => u._id);
            if (userIds.length > 0) {
                query['uploadedBy'] = { $in: userIds };
            } else {
                return res.json({ timetables: [] });
            }
        }

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
