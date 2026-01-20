const Timetable = require('../models/Timetable');
const File = require('../models/File');
const User = require('../models/User');
const storageService = require('./storageService');

class TimeTableService {

    /**
     * Adds or updates a timetable.
     * 1. Uploads new file to Drive.
     * 2. If upload succeeds, deletes old file (if exists).
     * 3. Updates Database.
     */

    static async addTimetable(user, file, subRole, batch) {
        if (!user || !user.canUploadTimetable) {
            throw new Error('Unauthorized: User cannot upload timetables');
        }
        // Logic to find existing timetable
        let query = { subRole: subRole };
        if (subRole === 'CSE' || subRole === 'IT' || subRole === 'AIML') {
            // For these depts, we also need batch
            if (!batch) throw new Error('Batch is required for ' + subRole);
            query.batch = batch;
        }
        const existingTimetable = await Timetable.findOne(query).populate('fileId');
        // 1. Upload NEW file first (Safe Strategy)
        const fileIdFromStorage = await storageService.saveFile(file); // returns drive ID
        // 2. Create File Record
        const newFile = new File({
            fileName: file.originalname,
            filePath: fileIdFromStorage,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: user._id,
            usage: { isPersonal: false } // System file
        });
        const savedFile = await newFile.save();
        // 3. Delete OLD file if exists
        if (existingTimetable) {
            const oldFileId = existingTimetable.fileId;
            if (oldFileId && oldFileId.filePath) {
                try {
                    await storageService.deleteFile(oldFileId.filePath);
                } catch (e) {
                    console.error("Warning: Failed to delete old file from Drive", e);
                }
                // Convert oldFileId to string or object to delete from DB
                await File.findByIdAndDelete(oldFileId._id);
            }
            // Update existing record
            existingTimetable.fileId = savedFile._id;
            existingTimetable.uploadedBy = user._id;
            existingTimetable.uploadDate = Date.now();
            await existingTimetable.save();
            return existingTimetable;
        } else {
            // Create NEW record
            const newTimetable = new Timetable({
                subRole: subRole,
                batch: batch || null,
                fileId: savedFile._id,
                uploadedBy: user._id
            });
            await newTimetable.save();
            return newTimetable;
        }
    }
}

module.exports = TimeTableService;