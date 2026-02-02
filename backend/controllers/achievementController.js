const Achievement = require('../models/Achievement');
const User = require('../models/User');
const SubRole = require('../models/SubRole'); // [NEW]
const File = require('../models/File');
const storageService = require('../services/storageService');
const mongoose = require('mongoose');

// 1. Add Achievement
exports.addAchievement = async (req, res) => {
    try {
        const { user: userJson, ...details } = req.body;
        const userObj = JSON.parse(userJson);
        const userId = userObj.id;

        // Fetch User details for snapshotting
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let proofFileId = null;
        let proofFilename = null;

        // Handle File Upload
        if (req.file) {
            const fileIdFromStorage = await storageService.saveFile(req.file);

            const newFile = new File({
                fileName: req.file.originalname,
                filePath: fileIdFromStorage,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadedBy: user._id,
                usage: { isPersonal: false } // Not personal drive file
            });
            const savedFile = await newFile.save();
            proofFileId = savedFile._id;
            proofFilename = req.file.originalname;
        }

        const newAchievement = new Achievement({
            ...details,
            userId: user.id,
            userRole: user.role,
            userName: user.username,
            dept: user.subRole, // Use subRole ObjectId directly
            proofFileId: proofFileId,
            proof: proofFilename,
            status: 'Pending',
            date: details.date || new Date()
        });

        await newAchievement.save();
        res.status(201).json({ message: 'Achievement added successfully', achievement: newAchievement });

    } catch (error) {
        console.error("Error adding achievement:", error);
        res.status(500).json({ message: 'Error adding achievement', error: error.message });
    }
};

// 2. Get Achievements (Filtered)
exports.getAchievements = async (req, res) => {
    try {
        const { userId, role, dept, status, limit } = req.query;
        let filter = {};

        if (userId) filter.userId = userId;
        // Support multiple roles (comma separated)
        if (role) {
            const roles = role.split(',');
            if (roles.length > 1) {
                filter.userRole = { $in: roles };
            } else {
                filter.userRole = role;
            }
        }

        // Department Filter:
        // [NEW] Resolve dept string to ObjectId
        if (dept) {
            if (mongoose.Types.ObjectId.isValid(dept)) {
                // If already an ID (e.g. from Dean dropdown using IDs), use it
                filter.dept = dept;
            } else {
                const subRoleDoc = await SubRole.findOne({
                    $or: [
                        { code: { $regex: new RegExp("^" + dept + "$", "i") } },
                        { name: { $regex: new RegExp("^" + dept + "$", "i") } },
                        { displayName: { $regex: new RegExp("^" + dept + "$", "i") } }
                    ]
                });
                if (subRoleDoc) {
                    filter.dept = subRoleDoc._id;
                } else {
                    // Force empty result if Dept not found? Or ignore?
                    // Let's force empty result
                    return res.json({ achievements: [] });
                }
            }
        }

        if (status) filter.status = status;

        const achievements = await Achievement.find(filter)
            .sort({ date: -1 })
            .limit(parseInt(limit) || 100);

        res.json({ achievements });

    } catch (error) {
        console.error("Error fetching achievements:", error);
        res.status(500).json({ message: 'Error fetching achievements', error: error.message });
    }
};

// 3. Update Status (Approve/Reject)
exports.updateAchievementStatus = async (req, res) => {
    try {
        const { id, status, approverId, approverName, approverRole } = req.body;

        const achievement = await Achievement.findById(id);
        if (!achievement) return res.status(404).json({ message: 'Achievement not found' });

        achievement.status = status;
        if (status === 'Approved' || status === 'Rejected') {
            achievement.approvedBy = approverName;
            achievement.approverId = approverId;
            achievement.approverRole = approverRole;
        } else {
            // Reset if moved back to Pending
            achievement.approvedBy = undefined;
            achievement.approverId = undefined;
            achievement.approverRole = undefined;
        }

        await achievement.save();
        res.json({ message: `Achievement ${status}`, achievement });

    } catch (error) {
        console.error("Error updating achievement:", error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
// 4. Get Leadership Users (For Dean Access Control)
exports.getLeadershipUsers = async (req, res) => {
    try {
        // Fetch all HODs and Associate Deans
        const users = await User.find({
            role: { $in: ['HOD', 'Asso.Dean'] }
        }).select('username role subRole id'); // Select distinct fields

        res.json({ users });
    } catch (error) {
        console.error("Error fetching leadership users:", error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};
