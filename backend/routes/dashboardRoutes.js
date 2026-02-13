const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Material = require('../models/Material');
const File = require('../models/File');
const SubRole = require('../models/SubRole'); // [NEW] Import SubRole Model

// GET /stats
router.get('/stats', async (req, res) => {
    try {
        const { role, subRole, id, batch } = req.query;

        // [FIX] Safe User Lookup
        let user = null;
        if (id && id !== 'undefined' && id !== 'null') {
             user = await User.findOne({ id: id });
        }
        
        // [FIX] Resolve SubRole String ("IT") to ObjectId
        // Most schemas (User, Achievement, Material, Announcement) store subRole as ObjectId ref 'SubRole'
        let subRoleId = null;
        if (subRole && subRole !== 'null' && subRole !== 'undefined' && subRole !== 'All') {
            const subRoleDoc = await SubRole.findOne({ subRole: subRole });
            if (subRoleDoc) {
                subRoleId = subRoleDoc._id;
            }
        }

        console.log(`[DEBUG] /stats Parsed: role=${role}, subRole=${subRole} -> ID=${subRoleId}, id=${id}, hasUser=${!!user}`);

        let stats = {};

        // 1. Announcements Count
        const announcementQuery = { $or: [] };
        const userBatch = user?.batch || batch;

        // Base Logic: Always fetch "All" role announcements
        announcementQuery.$or.push({ targetAudience: { $elemMatch: { role: 'All' } } });

        if (role) {
            // Check matching Role + SubRole
            if (subRoleId) {
                const criteria = [
                    { role: role, subRole: subRoleId }, // Exact Match with ObjectId
                    // Note: 'All' subRole in DB typically isn't stored as 'All' string in ObjectId field.
                    // Usually it's represented by absence or specific logic. 
                    // But if your logic inserts 'All' string into ObjectId field, it fails.
                    // Assuming 'All' targeting implies no subRole constraint or a specific flag.
                    // For now, let's trust exact match or "Exists: false"
                ];

                // Student Batch Logic
                if (role === 'Student' && userBatch) {
                     announcementQuery.$or.push({
                        targetAudience: {
                            $elemMatch: {
                                $or: [
                                    { role: role, subRole: subRoleId, batch: userBatch },
                                    { role: role, subRole: subRoleId, batch: { $exists: false } },
                                    // If targeting 'All' subroles for a 'Student', usually implies just Role='Student'
                                     { role: role, subRole: { $exists: false }, batch: userBatch },
                                ]
                            }
                        }
                    });
                } else {
                    // Faculty/HOD/Dean
                    announcementQuery.$or.push({
                        targetAudience: { $elemMatch: { role: role, subRole: subRoleId } }
                    });
                }
            } else {
                // If no subRole provided (or not found), just match Role
                announcementQuery.$or.push({ targetAudience: { $elemMatch: { role: role } } });
            }
        }
        
        const announcementCount = await Announcement.countDocuments(announcementQuery);
        stats.announcements = announcementCount;
        
        // Fetch recent announcements
        const recentanns = await Announcement.find(announcementQuery)
            .sort({ uploadedAt: -1 }).limit(3).select('title uploadedAt');
        stats.recentAnnouncements = recentanns;


        // 2. Shared Resources (GENERIC for All Roles)
        if (role && ['Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean'].includes(role)) {
            const materialQuery = { $or: [] };
            // Personally targeted
            if (id && id !== 'undefined') materialQuery.$or.push({ targetIndividualIds: { $in: [id] } });

            // Audience Match
            // Use subRoleId here
            if (subRoleId) {
                 if (role === 'Student' && userBatch) {
                     materialQuery.$or.push({
                        targetAudience: {
                            $elemMatch: {
                                role: role,
                                $or: [
                                    { subRole: subRoleId },
                                    { subRole: { $exists: false } }
                                ],
                                $or: [
                                    { batch: userBatch },
                                    { batch: { $exists: false } }
                                ]
                            }
                        }
                     });
                 } else {
                     // Faculty/HOD
                     materialQuery.$or.push({
                        targetAudience: {
                            $elemMatch: {
                                role: role,
                                $or: [
                                    { subRole: subRoleId },
                                    { subRole: { $exists: false } }
                                ]
                            }
                        }
                     });
                 }
            } else {
                 // No subrole constraint -> Match Role only
                 materialQuery.$or.push({
                    targetAudience: { $elemMatch: { role: role } }
                 });
            }

            // Exclude hidden
            const query = { ...materialQuery };
            if (id) query.hiddenFor = { $ne: id };

            const materialCount = await Material.countDocuments(query);
            stats.sharedResources = materialCount;
        }

        // 3. Storage Used (Faculty/HOD/Dean)
        if (['Faculty', 'HOD', 'Dean', 'Asso.Dean'].includes(role)) {
            if (user && user._id) {
                const result = await File.aggregate([
                    { $match: { uploadedBy: user._id } },
                    { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
                ]);
                stats.storageUsed = result.length > 0 ? result[0].totalSize : 0;
            } else {
                stats.storageUsed = 0;
            }
        }
        // [FIX] Add default for Student so UI doesn't break if it expects key
        if (role === 'Student') stats.storageUsed = 0;


        // 4. Achievement Stats (Personal)
        const Achievement = require('../models/Achievement');
        const myAchCount = await Achievement.countDocuments({ userId: id, status: 'Approved' });
        stats.userAchievements = myAchCount;

        // 5. Department Stats (Faculty/HOD)
        if (role === 'Faculty' || role === 'HOD') {
            if (subRoleId) { // [FIX] Use subRoleId (ObjectId)
                // Dept Achievements (Approved)
                const deptAchCount = await Achievement.countDocuments({ dept: subRoleId, status: 'Approved' }); // [FIX] dept field is ObjectId
                stats.deptAchievements = deptAchCount;

                // Pending Approvals
                let pendingQuery = { dept: subRoleId, status: 'Pending' }; // [FIX] dept field is ObjectId
                if (role === 'Faculty') {
                    pendingQuery.userRole = 'Student';
                }
                const pendingCount = await Achievement.countDocuments(pendingQuery);
                stats.pendingApprovals = pendingCount;
            } else {
                stats.deptAchievements = 0;
                stats.pendingApprovals = 0;
            }

            if (subRoleId) {
                // Student Count
                const studentCount = await User.countDocuments({ role: 'Student', subRole: subRoleId }); // [FIX] subRole is ObjectId
                stats.studentCount = studentCount;
            } else {
                stats.studentCount = 0;
            }
            // Faculty Count (HOD Only)
            if (role === 'HOD' && subRoleId) {
                 const facultyCount = await User.countDocuments({ role: 'Faculty', subRole: subRoleId }); // [FIX] subRole is ObjectId
                 stats.facultyCount = facultyCount;
            } else {
                 if (role === 'HOD') stats.facultyCount = 0;
            }
        }

        // C. Dean / Associate Dean Stats (College Level)
        if (role === 'Dean' || role === 'Asso.Dean') {
            // 1. Faculty Count (All Faculty or Filtered if Dean has a dept?)
            // Assuming College Level Deans see ALL Faculty
            const facultyCount = await User.countDocuments({ role: 'Faculty' });
            stats.facultyCount = facultyCount;

            // 2. Student Count (All Students)
            const studentCount = await User.countDocuments({ role: 'Student' });
            stats.studentCount = studentCount;

            // 3. Leadership Achievements (Approved HOD + Asso.Dean)
            const leadershipAchCount = await Achievement.countDocuments({ 
                role: { $in: ['HOD', 'Asso.Dean'] }, 
                status: 'Approved' 
            });
             // Map to 'deptAchievements' key as expected by Dashboard.jsx
            stats.deptAchievements = leadershipAchCount;

            // 4. Pending Approvals (Pending HOD + Asso.Dean)
            const pendingLeadershipCount = await Achievement.countDocuments({ 
                role: { $in: ['HOD', 'Asso.Dean'] }, 
                status: 'Pending' 
            });
            stats.pendingApprovals = pendingLeadershipCount;

            console.log("Dean Stats Calculated:", { facultyCount, studentCount, leadershipAchCount, pendingLeadershipCount }); // DEBUG LOG
        }

        res.json(stats);

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error fetching stats", error });
    }
});

module.exports = router;
