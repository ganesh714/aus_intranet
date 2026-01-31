const Material = require('../models/Material');
const File = require('../models/File');
const User = require('../models/User');
const DriveItem = require('../models/DriveItem');
const storageService = require('./storageService');

class MaterialService {

    // Hierarchy Definition
    static ROLE_HIERARCHY = {
        'Admin': 1,
        'Officers': 1,
        'Dean': 2,
        'Asso.Dean': 3,
        'Associate Dean': 3, // Alias
        'Assoc Dean': 3,     // Alias
        'HOD': 4,
        'Faculty': 5,
        'Student': 6
    };

    // 1. Add Material
    static async addMaterial(file, body) {
        let { title, subject, targetAudience, targetIndividualIds, user } = body;

        // Ensure targetAudience is parsed correctly
        if (typeof targetAudience === 'string') {
            try {
                targetAudience = JSON.parse(targetAudience);
            } catch (e) {
                targetAudience = [];
            }
        }

        const userDb = await User.findOne({ id: user.id });
        if (!userDb) throw new Error('User not found');
        if (!file) throw new Error('No file uploaded!');

        // --- HIERARCHY VALIDATION ---
        const senderLevel = MaterialService.ROLE_HIERARCHY[user.role] || 99;

        // 1. Validate Group Rules
        // Rule: Sender Level <= Target Role Level (Lower number is higher rank)
        for (const rule of targetAudience) {
            const targetLevel = MaterialService.ROLE_HIERARCHY[rule.role] || 99;
            if (senderLevel > targetLevel) {
                throw new Error(`Permission Denied: You cannot share documents with ${rule.role}s.`);
            }

            // Sub-Role (Dept) Constraint for HOD/Faculty
            // EXCEPTION: Allow Cross-Dept sharing if sharing with SAME ROLE (Peer-to-Peer)
            if (['HOD', 'Faculty'].includes(user.role) && user.role !== rule.role) {
                // If rule has a subRole, it must match sender's subRole
                // If rule has NO subRole (all depts), it is FORBIDDEN for HOD/Faculty (unless peer)
                if (!rule.subRole || rule.subRole === 'All') {
                     throw new Error(`Permission Denied: You cannot share with 'All Departments'. Please specify your department.`);
                }
                if (rule.subRole !== user.subRole) {
                     throw new Error(`Permission Denied: You cannot share with ${rule.subRole} department.`);
                }
            }
        }

        // 2. Validate Individual Targets
        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch (e) { return [val]; }
        };
        const individualIds = parseArray(targetIndividualIds);

        if (individualIds.length > 0) {
            const targetUsers = await User.find({ id: { $in: individualIds } });
            for (const tUser of targetUsers) {
                const targetLevel = MaterialService.ROLE_HIERARCHY[tUser.role] || 99;
                if (senderLevel > targetLevel) {
                    throw new Error(`Permission Denied: You cannot share documents with user ${tUser.username} (${tUser.role}).`);
                }

                 // Sub-Role (Dept) Constraint for HOD/Faculty
                 // EXCEPTION: Allow Cross-Dept if Peer (Same Role)
                if (['HOD', 'Faculty'].includes(user.role) && user.role !== tUser.role) {
                    // Check if target user is in same department
                    // Exception: Sending to Student? Students usually have subRole e.g. 'CSE'.
                    // If target user subRole doesn't match, block.
                    // NOTE: Some higher officials might not have subRole, but HOD/Faculty can't send to them anyway (rank check).
                    // So we safely check subRole equality.
                    if (tUser.subRole !== user.subRole) {
                        throw new Error(`Permission Denied: You cannot share with user in ${tUser.subRole} department.`);
                    }
                }
            }
        }
        // -----------------------------

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
