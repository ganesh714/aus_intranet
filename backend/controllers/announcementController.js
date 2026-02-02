const Announcement = require('../models/Announcement');
const SubRole = require('../models/SubRole'); // [NEW]
const File = require('../models/File');
const User = require('../models/User');
const storageService = require('../services/storageService');
const AnnouncementContext = require('../strategies/AnnouncementContext');
const mongoose = require('mongoose'); // [NEW]

const getAnnouncements = async (req, res) => {
    try {
        const { role, subRole, id, batch } = req.query;

        // [OPTIMIZATION] Resolve query subRole string to ObjectId
        let subRoleId = null;

        if (subRole === 'All' || subRole === 'null') {
            subRoleId = null;
        }
        else if (subRole && mongoose.Types.ObjectId.isValid(subRole)) {
            // Optimization: If it's already an ID, use it directly
            subRoleId = subRole;
        }
        else if (subRole && typeof subRole === 'string') {
            // Fallback: Resolve name to ID
            const subDoc = await SubRole.findOne({
                $or: [{ code: subRole }, { displayName: subRole }, { name: subRole }]
            });
            if (subDoc) subRoleId = subDoc._id;
        } else {
            subRoleId = subRole; // If it's undefined or something else, pass as is (Strategy handles it)
        }

        const context = new AnnouncementContext(role, subRoleId, batch, id);
        const announcements = await context.execute();

        res.json({ announcements });
    } catch (error) {
        console.error("Strategy Error:", error);
        res.status(500).json({ message: "Error fetching announcements" });
    }
};

const addAnnouncement = async (req, res) => {
    try {
        const { title, description } = req.body;
        const user = JSON.parse(req.body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });

        let savedFileId = null;

        if (req.file) {
            // Upload via Service
            const fileIdFromStorage = await storageService.saveFile(req.file);

            const newFile = new File({
                fileName: req.file.originalname,
                filePath: fileIdFromStorage,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadedBy: userDb._id,
                usage: { isAnnouncement: true }
            });

            const savedFile = await newFile.save();
            savedFileId = savedFile._id;
        }

        let targets = [];
        try {
            targets = typeof req.body.targets === 'string' ? JSON.parse(req.body.targets) : req.body.targets;
        } catch (e) {
            console.error("Error parsing targets:", e);
            targets = [];
        }

        // [NEW] Resolve target subRoles to ObjectIds
        for (const t of targets) {
            if (t.subRole && t.subRole !== 'All') {
                if (mongoose.Types.ObjectId.isValid(t.subRole)) {
                    // Optimization: Use ID directly
                } else {
                    const subDoc = await SubRole.findOne({
                        $or: [{ displayName: t.subRole }, { name: t.subRole }, { code: t.subRole }]
                    });
                    if (subDoc) {
                        t.subRole = subDoc._id;
                    }
                }
            } else if (t.subRole === 'All') {
                t.subRole = null; // Store as null for 'All'
            }
        }

        const newAnnouncement = new Announcement({
            title,
            description,
            fileId: savedFileId,
            uploadedBy: userDb._id,
            targetAudience: targets
        });

        await newAnnouncement.save();
        res.status(200).json({ message: 'Announcement uploaded successfully!', announcement: newAnnouncement });
    } catch (error) {
        console.error("Upload Error", error);
        res.status(500).json({ message: 'Error uploading announcement', error });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Announcement.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Error deleting announcement" });
    }
};

module.exports = {
    getAnnouncements,
    addAnnouncement,
    deleteAnnouncement
};
