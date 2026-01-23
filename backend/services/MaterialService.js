const Material = require('../models/Material');
const File = require('../models/File');
const User = require('../models/User');
const DriveItem = require('../models/DriveItem');
const storageService = require('./storageService');

class MaterialService {

    // 1. Add Material
    static async addMaterial(file, body) {
        const { title, subject, targetIndividualIds } = body;
        const targetAudience = JSON.parse(body.targetAudience || '[]');
        const user = JSON.parse(body.user);

        const userDb = await User.findOne({ id: user.id });
        if (!userDb) throw new Error('User not found');
        if (!file) throw new Error('No file uploaded!');

        // Helper to parse if stringified
        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try {
                return JSON.parse(val);
            } catch (e) {
                return [val];
            }
        };

        const individualIds = parseArray(targetIndividualIds);

        // Upload via Service
        const fileIdFromStorage = await storageService.saveFile(file);

        const newFile = new File({
            fileName: file.originalname,
            filePath: fileIdFromStorage, // Store ID
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: userDb._id,
            usage: { isDeptDocument: true }
        });
        const savedFile = await newFile.save();

        const newMaterial = new Material({
            title,
            subject,
            targetAudience: targetAudience,
            targetIndividualIds: individualIds,
            fileId: savedFile._id,
            uploadedBy: userDb._id
        });

        return await newMaterial.save();
    }

    // 2. Get Materials (Audience Matching Logic)
    static async getMaterials({ role, subRole, batch, id }) {
        let query = {};
        const userId = id;

        // Universal Check: Am I personally targeted?
        if (userId) {
            query.hiddenFor = { $ne: userId };
        }

        let orConditions = [];

        // 1. Personally Targeted
        if (userId) {
            orConditions.push({ targetIndividualIds: { $in: [userId] } });
        }

        // 2. Uploaded by Me (Everyone)
        if (userId) {
            const userMe = await User.findOne({ id: userId });
            if (userMe) {
                orConditions.push({ uploadedBy: userMe._id });
            }
        }

        // 3. Rule-Based Audience Matching
        const audienceMatch = {
            targetAudience: {
                $elemMatch: {
                    role: role,
                    $or: [
                        { subRole: subRole },
                        { subRole: { $exists: false } }, // If rule has no subRole, it applies to all depts
                        { subRole: null },
                        { subRole: '' }
                    ],
                    $or: [
                        { batch: batch },
                        { batch: { $exists: false } }, // If rule has no batch, it applies to all batches
                        { batch: null },
                        { batch: '' }
                    ]
                }
            }
        };
        orConditions.push(audienceMatch);

        // Combine all conditions
        query.$or = orConditions;

        return await Material.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role subRole id')
            .sort({ uploadedAt: -1 });
    }

    // 3. Copy Shared Material to Drive
    static async copySharedToDrive(materialId, targetFolderId, userId) {
        const material = await Material.findById(materialId).populate('fileId');
        if (!material || !material.fileId) throw new Error('Material not found');

        const userUser = await User.findOne({ id: userId });
        if (!userUser) throw new Error('User not found');

        // Clone the file record
        const originalFile = await File.findById(material.fileId);

        // Physically copy the file in Drive (Fix Shared Deletion Bug)
        const newFileIdFromStorage = await storageService.copyFile(originalFile.filePath);

        const newFile = new File({
            fileName: material.title, // Use Material title as filename
            filePath: newFileIdFromStorage, // Use NEW path
            fileType: originalFile.fileType,
            fileSize: originalFile.fileSize,
            uploadedBy: userUser._id,
            usage: { isPersonal: true }
        });
        const savedFile = await newFile.save();

        // Create Drive Item
        const newDriveItem = new DriveItem({
            name: material.title,
            type: 'file',
            parent: targetFolderId,
            fileId: savedFile._id,
            owner: userUser._id,
            size: originalFile.fileSize,
            mimeType: originalFile.fileType
        });
        return await newDriveItem.save();
    }

    // 4. Hide Shared Material
    static async hideSharedMaterial(materialId, userId) {
        return await Material.findByIdAndUpdate(materialId, {
            $addToSet: { hiddenFor: userId }
        });
    }
}

module.exports = MaterialService;
