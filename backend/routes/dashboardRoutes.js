const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Material = require('../models/Material');
const File = require('../models/File');

// GET /stats
router.get('/stats', async (req, res) => {
    try {
        const { role, subRole, id, batch } = req.query;
        const user = await User.findOne({ id: id });

        let stats = {};

        // 1. Announcements Count (Accessible to User)
        // Reuse logic from /get-announcements roughly
        const announcementQuery = { $or: [] };

        // Use User attributes from DB if available, falling back to query
        const userBatch = user?.batch || batch;

        if (role) {
            if (subRole && subRole !== 'null') {
                const criteria = [
                    { role: role, subRole: subRole },
                    { role: role, subRole: 'All' }
                ];

                if (role === 'Student' && userBatch) {
                    announcementQuery.$or.push({
                        targetAudience: {
                            $elemMatch: {
                                $or: [
                                    { role: role, subRole: subRole, batch: userBatch },
                                    { role: role, subRole: subRole, batch: { $exists: false } },
                                    { role: role, subRole: 'All', batch: userBatch },
                                    { role: role, subRole: 'All', batch: { $exists: false } }
                                ]
                            }
                        }
                    });
                } else {
                    announcementQuery.$or.push({
                        targetAudience: { $elemMatch: { $or: criteria } }
                    });
                }
            } else {
                announcementQuery.$or.push({ targetAudience: { $elemMatch: { role: role } } });
            }
        }
        announcementQuery.$or.push({ targetAudience: { $elemMatch: { role: 'All' } } });

        // Also include own announcements if any (though usually for viewing feed)
        // For stats "Announcements" usually means "New Announcements to read" for students
        // For Faculty, "Announcements Sent" might be different. 
        // User asked for "Connect Announcements". 
        // For Student: "Announcements" -> Count of visible announcements.
        // For Faculty: "Announcements" -> Count of visible announcements (dashboard usually shows feed count) OR sent count?
        // Use case implies "Announcements" widget shows recent feed. So count of feed is appropriate.

        const announcementCount = await Announcement.countDocuments(announcementQuery);
        stats.announcements = announcementCount;

        // Fetch recent 3 announcements for the widget
        const recentanns = await Announcement.find(announcementQuery)
            .sort({ uploadedAt: -1 })
            .limit(3)
            .select('title uploadedAt');

        stats.recentAnnouncements = recentanns;


        // 2. Shared Resources (Student Only) -> Count of Materials
        if (role === 'Student') {
            const materialQuery = { $or: [] };
            // Personally targeted
            if (id) materialQuery.$or.push({ targetIndividualIds: { $in: [id] } });

            // Audience Match
            materialQuery.$or.push({
                targetAudience: {
                    $elemMatch: {
                        role: role,
                        $or: [
                            { subRole: subRole },
                            { subRole: { $exists: false } }
                        ],
                        $or: [
                            { batch: userBatch },
                            { batch: { $exists: false } }
                        ]
                    }
                }
            });

            // Exclude hidden
            // query.hiddenFor = { $ne: id }; // Logic matches get-materials
            const materialCount = await Material.countDocuments({
                ...materialQuery,
                hiddenFor: { $ne: id }
            });
            stats.sharedResources = materialCount;
        }


        // 3. Storage Used (Faculty/HOD)
        if (role === 'Faculty' || role === 'HOD') {
            if (user) {
                // Aggregate size of files uploaded by this user
                const result = await File.aggregate([
                    { $match: { uploadedBy: user._id } },
                    { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
                ]);
                stats.storageUsed = result.length > 0 ? result[0].totalSize : 0;
            } else {
                stats.storageUsed = 0;
            }
        }


        // 4. Faculty Count (HOD Only)
        if (role === 'HOD') {
            if (subRole) {
                const facultyCount = await User.countDocuments({ role: 'Faculty', subRole: subRole });
                stats.facultyCount = facultyCount;
            } else {
                stats.facultyCount = 0;
            }
        }

        res.json(stats);

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error fetching stats", error });
    }
});

module.exports = router;
