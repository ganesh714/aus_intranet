const Announcement = require('../models/Announcement');
const File = require('../models/File');
const User = require('../models/User');
const storageService = require('../services/storageService');
const AnnouncementContext = require('../strategies/AnnouncementContext');

const getAnnouncements = async (req, res) => {
    try {
        const { role, subRole, id, batch } = req.query;

        const context = new AnnouncementContext(role, subRole, batch, id);
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

module.exports = {
    getAnnouncements,
    addAnnouncement
};
