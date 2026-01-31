const Material = require('../models/Material');
const File = require('../models/File');
const User = require('../models/User');
const DriveItem = require('../models/DriveItem');
const storageService = require('./storageService');

class MaterialService {

    // Hierarchy Definition
    static ROLE_HIERARCHY = {
        'Admin': 1,
        'Officers': 2,
        'Dean': 3,
        'Asso.Dean': 4,
        'Associate Dean': 4, // Alias
        'Assoc Dean': 4,     // Alias
        'HOD': 5,
        'Faculty': 6,
        'Student': 7
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

        // Ensure user is parsed correctly (Fix for FormData stringification)
        if (typeof user === 'string') {
             try {
                 user = JSON.parse(user);
             } catch (e) {
                 throw new Error('Invalid User Data');
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

            // Sub-Role (Dept) Constraint REMOVED per user request (Step 650)
            // Cross-Department sharing is now allowed if rank is valid.
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

                 // Sub-Role (Dept) Constraint REMOVED per user request (Step 650)
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

        const materials = await Material.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role subRole id')
            .sort({ uploadedAt: -1 })
            .lean(); // Use lean() to allow modification

        // Populate targetIndividualIds with User Names (for display)
        // 1. Collect all unique IDs
        const allTargetIds = new Set();
        materials.forEach(m => {
            if (m.targetIndividualIds && m.targetIndividualIds.length > 0) {
                m.targetIndividualIds.forEach(uid => allTargetIds.add(uid));
            }
        });

        // 2. Fetch User Details
        if (allTargetIds.size > 0) {
            const users = await User.find({ id: { $in: Array.from(allTargetIds) } }).select('id username');
            const userMap = {};
            users.forEach(u => userMap[u.id] = u.username);

            // 3. Attach names to materials
            materials.forEach(m => {
                if (m.targetIndividualIds && m.targetIndividualIds.length > 0) {
                    m.targetUserDetails = m.targetIndividualIds.map(uid => ({
                        id: uid,
                        username: userMap[uid] || uid // Fallback to ID if name not found
                    }));
                } else {
                    m.targetUserDetails = [];
                }
            });
        }

        return materials;
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
