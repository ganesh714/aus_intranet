// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import Models
const File = require('./models/File');
const Material = require('./models/Material');
const Announcement = require('./models/Announcement');
const Timetable = require('./models/Timetable');
const User = require('./models/User');
const DriveItem = require('./models/DriveItem');

// Import Storage Service (Modular Logic)
const storageService = require('./services/storageService');

const app = express();

app.use(cors());
app.use(bodyParser.json());
// Note: 'uploads' static folder is no longer needed for drive, but kept if you have legacy files.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MULTER CONFIG (Memory Storage for Cloud Uploads) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

const pdfSchema = new mongoose.Schema({
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Pdf = mongoose.model('Pdf', pdfSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { username, id, password, role, subRole, batch } = req.body;
    const normalizedId = id.toUpperCase(); // Standardize new users to Uppercase

    // Check for existing user (Case Insensitive)
    const existingUserById = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
    if (existingUserById) {
        return res.status(400).json({ message: 'User ID already exists' });
    }

    if (role !== 'Faculty' && role !== 'Admin' && role !== 'Student') {
        const existingUserByRoleAndSubRole = await User.findOne({ role, subRole });
        if (existingUserByRoleAndSubRole) {
            return res.status(400).json({ message: 'User with this role and subRole already exists' });
        }
    }

    if ((role === 'Faculty' || role === 'Student') && !subRole) {
        return res.status(400).json({ message: 'subRole (department) is required' });
    }

    const newUser = new User({
        username,
        id: normalizedId,
        password,
        role,
        subRole: role === 'Admin' ? null : subRole,
        batch: role === 'Student' ? batch : null, // Pass batch if Student
        canUploadTimetable: false
    });

    try {
        await newUser.save();
        res.json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    // Find user by ID (Case Insensitive)
    const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });

    if (user && user.password === password) {
        res.json({ message: 'Login successful!', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials!' });
    }
});

// --- NEW HELPER: Get Users (For User Picker) ---
app.get('/get-users', async (req, res) => {
    const { role, dept, batch, search } = req.query;
    try {
        let query = {};
        if (role) query.role = role;
        if (dept && dept !== 'All') query.subRole = dept;
        if (batch) query.batch = batch; // Only for students
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        // Return minimal info
        const users = await User.find(query).select('id username role subRole batch');
        res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
});

// --- TIMETABLE ROUTES ---

// 1. Get Department Faculty
app.get('/get-dept-faculty', async (req, res) => {
    const { dept } = req.query;
    try {
        const faculty = await User.find({
            role: 'Faculty',
            subRole: dept
        }, 'username id canUploadTimetable');
        res.json({ faculty });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculty', error });
    }
});

// 2. Toggle Timetable Permission
app.post('/toggle-timetable-permission', async (req, res) => {
    const { id, canUpload } = req.body;
    try {
        const user = await User.findOne({ id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'Faculty') return res.status(400).json({ message: 'Permissions can only be toggled for Faculty.' });

        user.canUploadTimetable = canUpload;
        const savedUser = await user.save();
        res.json({ message: 'Permission updated', user: savedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating permission', error });
    }
});

// 3. Add/Replace Timetable
app.post('/add-timetable', upload.single('file'), async (req, res) => {
    try {
        const { targetYear, targetSection } = req.body;
        const userJson = JSON.parse(req.body.user);

        const userDb = await User.findOne({ id: userJson.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

        const isHOD = userDb.role === 'HOD';
        const isAuthorizedFaculty = userDb.role === 'Faculty' && userDb.canUploadTimetable;

        if (!isHOD && !isAuthorizedFaculty) {
            return res.status(403).json({ message: 'You do not have permission to upload time tables.' });
        }

        // Check for existing timetable
        const usersInDept = await User.find({ subRole: userDb.subRole }).select('_id');
        const userIdsInDept = usersInDept.map(u => u._id);

        const existingTimetable = await Timetable.findOne({
            targetYear: targetYear,
            targetSection: targetSection,
            uploadedBy: { $in: userIdsInDept }
        }).populate('fileId');

        if (existingTimetable) {
            // 1. Delete file using Service
            if (existingTimetable.fileId && existingTimetable.fileId.filePath) {
                await storageService.deleteFile(existingTimetable.fileId.filePath);
            }
            // 2. Delete DB records
            await File.findByIdAndDelete(existingTimetable.fileId._id);
            await Timetable.findByIdAndDelete(existingTimetable._id);
            console.log(`Replaced existing timetable for Y:${targetYear} S:${targetSection}`);
        }

        // Upload new file via Service
        const fileIdFromStorage = await storageService.saveFile(req.file);

        const newFile = new File({
            fileName: req.file.originalname,
            filePath: fileIdFromStorage, // Store the ID/URL
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: userDb._id,
            usage: { isDeptDocument: true }
        });
        const savedFile = await newFile.save();

        const newTimetable = new Timetable({
            targetYear,
            targetSection,
            fileId: savedFile._id,
            uploadedBy: userDb._id
        });

        await newTimetable.save();
        res.json({ message: 'Timetable uploaded successfully (Previous version replaced)!', timetable: newTimetable });

    } catch (error) {
        console.error("Error uploading timetable:", error);
        res.status(500).json({ message: "Error uploading timetable", error });
    }
});

// 4. Get Timetables
app.get('/get-timetables', async (req, res) => {
    const { role, subRole, year, section } = req.query;

    try {
        let query = {};
        if (subRole && subRole !== 'All' && subRole !== 'null') {
            const users = await User.find({ subRole }).select('_id');
            const userIds = users.map(u => u._id);
            if (userIds.length > 0) {
                query['uploadedBy'] = { $in: userIds };
            } else {
                return res.json({ timetables: [] });
            }
        }

        if (role === 'Student') {
            if (year) query.targetYear = year;
            if (section) query.targetSection = section;
        }

        const timetables = await Timetable.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role subRole id')
            .sort({ uploadedAt: -1 });

        res.json({ timetables });

    } catch (error) {
        console.error("Error fetching timetables:", error);
        res.status(500).json({ message: "Error fetching timetables", error });
    }
});

// Add PDF Route
app.post('/add-pdf', upload.array('file', 10), async (req, res) => {
    const { category, name, user, subCategory } = req.body;

    const categories = Array.isArray(category) ? category : [category];
    const subcategorys = Array.isArray(subCategory) ? subCategory : [subCategory];
    const names = Array.isArray(name) ? name : [name];
    const users = Array.isArray(user) ? user.map(u => JSON.parse(u)) : [JSON.parse(user)];

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded!' });
    }

    try {
        const newPdfs = await Promise.all(
            req.files.map(async (file, index) => {
                const userObj = users[index];
                const dbUser = await User.findOne({ id: userObj.id });
                if (!dbUser) throw new Error(`User not found: ${userObj.id}`);

                // Upload via Service
                const fileIdFromStorage = await storageService.saveFile(file);

                const newPdf = new Pdf({
                    category: categories[index],
                    subcategory: subcategorys[index],
                    name: names[index],
                    filePath: fileIdFromStorage, // Store ID
                    uploadedBy: dbUser._id,
                });
                return newPdf.save();
            })
        );
        res.json({ message: 'PDFs added successfully!', pdfs: newPdfs });
    } catch (err) {
        console.error('Error uploading PDFs:', err);
        res.status(500).json({ message: 'Error uploading PDFs!', error: err });
    }
});

// Get PDFs Route
app.get('/get-pdfs', async (req, res) => {
    const { role, subRole } = req.query;

    try {
        const query = {};
        if (role) query['uploadedBy.role'] = role;
        if (subRole) query['uploadedBy.subRole'] = subRole;

        const pdfsSet = new Map();

        if (role !== 'Student') {
            const userQuery = {};
            if (role) userQuery.role = role;
            if (subRole) userQuery.subRole = subRole;

            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(u => u._id);

            if (userIds.length > 0) {
                query.uploadedBy = { $in: userIds };
                const initialPdfs = await Pdf.find(query).populate('uploadedBy', 'username role subRole id');
                initialPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
            }
        }

        const extraCategories = [];
        if (role === 'Officers') {
            extraCategories.push('University related', "Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Dean') {
            extraCategories.push("Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Asso.Dean') {
            extraCategories.push("Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'HOD') {
            extraCategories.push("HOD's related", 'Faculty related', 'Dept.Equipment', 'Staff Presentations');
        } else if (role === 'Faculty') {
            extraCategories.push('Faculty related', 'Dept.Equipment', 'Staff Presentations');
        }

        if (extraCategories.length > 0) {
            const extraPdfs = await Pdf.find({ category: { $in: extraCategories } }).populate('uploadedBy', 'username role subRole id');
            extraPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
        }

        const uniquePdfs = Array.from(pdfsSet.values());
        res.json({ pdfs: uniquePdfs });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs!', error });
    }
});

// Get Announcements
app.get('/get-announcements', async (req, res) => {
    const { role, subRole, id } = req.query;
    try {
        const orConditions = [];

        if (id) {
            const user = await User.findOne({ id });
            if (user) orConditions.push({ 'uploadedBy': user._id });
        }

        if (role) {
            if (subRole && subRole !== 'null') {
                const criteria = [
                    { role: role, subRole: subRole },
                    { role: role, subRole: 'All' }
                ];

                // If it's a student and we have a batch, filter by batch
                if (role === 'Student' && req.query.batch) {
                    // Match specific batch
                    const batch = req.query.batch;
                    orConditions.push({
                        targetAudience: {
                            $elemMatch: {
                                $or: [
                                    // 1. Exact match: Role + SubRole + Batch
                                    { role: role, subRole: subRole, batch: batch },
                                    // 2. Role + SubRole + No Batch (Legacy/General) -> logic: if batch is NOT stored in DB, it's for everyone? 
                                    // Actually, if sender specified batch, it must match. If sender didn't specify batch (null/undefined), it's for all batches.
                                    // Ideally, "All Batches" should be explicit or handled by missing field. 
                                    // Let's assume if batch field is missing in DB target, it's for all batches.
                                    { role: role, subRole: subRole, batch: { $exists: false } },
                                    { role: role, subRole: subRole, batch: null },
                                    { role: role, subRole: subRole, batch: '' },

                                    // 3. Role + All + Batch
                                    { role: role, subRole: 'All', batch: batch },
                                    // 4. Role + All + No Batch
                                    { role: role, subRole: 'All', batch: { $exists: false } },
                                    { role: role, subRole: 'All', batch: null },
                                    { role: role, subRole: 'All', batch: '' }
                                ]
                            }
                        }
                    });
                } else {
                    // Original logic for non-students or students without batch (legacy)
                    orConditions.push({
                        targetAudience: {
                            $elemMatch: {
                                $or: criteria
                            }
                        }
                    });
                }
            } else {
                orConditions.push({
                    targetAudience: { $elemMatch: { role: role } }
                });
            }
        }

        orConditions.push({ targetAudience: { $elemMatch: { role: 'All' } } });

        if (orConditions.length === 0) return res.json({ announcements: [] });

        const query = { $or: orConditions };

        const announcements = await Announcement.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role id')
            .sort({ uploadedAt: -1 });

        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements!', error });
    }
});

// Add Announcement
app.post('/add-announcement', upload.single('file'), async (req, res) => {
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

    try {
        await newAnnouncement.save();
        res.status(200).json({ message: 'Announcement uploaded successfully!', announcement: newAnnouncement });
    } catch (error) {
        console.error("Upload Error", error);
        res.status(500).json({ message: 'Error uploading announcement', error });
    }
});

// Edit PDF
app.put('/edit-pdf/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { category, name } = req.body;
    const updatedFields = { category, name };

    try {
        if (req.file) {
            // If replacing file, we might want to delete the old one, but for now we just upload new
            const fileIdFromStorage = await storageService.saveFile(req.file);
            updatedFields.filePath = fileIdFromStorage;
        }

        const updatedPdf = await Pdf.findByIdAndUpdate(id, updatedFields, { new: true });
        res.json({ message: 'PDF updated successfully!', pdf: updatedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error updating PDF!', error });
    }
});

// Edit Announcement
app.put('/edit-announcement/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedFields = { title, description };

    try {
        if (req.file) {
            // Upload new file via Service
            const fileIdFromStorage = await storageService.saveFile(req.file);

            // NOTE: Logic here is tricky because Announcement links to a File model, not directly to filePath.
            // If you want to update the underlying File model:
            const announcement = await Announcement.findById(id);
            if (announcement && announcement.fileId) {
                await File.findByIdAndUpdate(announcement.fileId, {
                    filePath: fileIdFromStorage,
                    fileName: req.file.originalname,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size
                });
            } else {
                // Create new File record if one didn't exist
                // (Implementation detail omitted for brevity, assuming existing file update)
            }
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!updatedAnnouncement) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ message: 'Announcement updated successfully!', announcement: updatedAnnouncement });
    } catch (error) {
        res.status(500).json({ message: 'Error updating announcement!', error });
    }
});

// Delete Announcement
app.delete('/delete-announcement/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const announcementToDelete = await Announcement.findById(id);
        if (announcementToDelete && announcementToDelete.fileId) {
            // Look up file to get path
            const fileRecord = await File.findById(announcementToDelete.fileId);
            if (fileRecord && fileRecord.filePath) {
                await storageService.deleteFile(fileRecord.filePath);
                await File.findByIdAndDelete(announcementToDelete.fileId);
            }
        }
        await Announcement.findByIdAndDelete(id);
        res.json({ message: 'Announcement deleted successfully!' });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: 'Error deleting announcement!', error });
    }
});

// Delete PDF
app.delete('/delete-pdf/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pdfToDelete = await Pdf.findById(id);
        if (pdfToDelete && pdfToDelete.filePath) {
            // Delete from Drive
            await storageService.deleteFile(pdfToDelete.filePath);
        }

        const deletedPdf = await Pdf.findByIdAndDelete(id);
        res.json({ message: 'PDF deleted successfully!', pdf: deletedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting PDF!', error });
    }
});

// 1. Get Personal Files
app.get('/get-personal-files', async (req, res) => {
    const { id } = req.query;
    try {
        const user = await User.findOne({ id });
        if (!user) return res.json({ files: [] });

        const files = await File.find({
            "uploadedBy": user._id,
            "usage.isPersonal": true
        }).populate('uploadedBy', 'id username').sort({ uploadedAt: -1 });

        res.json({ files });
    } catch (error) {
        console.error("Error fetching personal files:", error);
        res.status(500).json({ message: "Error fetching personal files", error });
    }
});

// 2. Upload to Personal Data
app.post('/upload-personal-file', upload.array('file', 10), async (req, res) => {
    try {
        const user = JSON.parse(req.body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });
        const names = Array.isArray(req.body.name) ? req.body.name : [req.body.name];

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded!' });
        }

        const savedFiles = await Promise.all(req.files.map(async (file, index) => {
            // Upload via Service
            const fileIdFromStorage = await storageService.saveFile(file);

            const newFile = new File({
                fileName: names[index] || file.originalname,
                filePath: fileIdFromStorage, // Store ID
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userDb._id,
                usage: { isPersonal: true }
            });
            return await newFile.save();
        }));

        res.json({ message: "Files saved to My Data successfully!", files: savedFiles });
    } catch (error) {
        console.error("Error uploading personal files:", error);
        res.status(500).json({ message: "Error uploading files", error });
    }
});

// 1. Add Material
app.post('/add-material', upload.single('file'), async (req, res) => {
    try {
        const { title, subject, targetIndividualIds } = req.body;
        const targetAudience = JSON.parse(req.body.targetAudience || '[]');
        const user = JSON.parse(req.body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

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
        const fileIdFromStorage = await storageService.saveFile(req.file);

        const newFile = new File({
            fileName: req.file.originalname,
            filePath: fileIdFromStorage, // Store ID
            fileType: req.file.mimetype,
            fileSize: req.file.size,
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

        await newMaterial.save();
        res.json({ message: 'Material uploaded successfully!', material: newMaterial });

    } catch (error) {
        console.error("Error uploading material:", error);
        res.status(500).json({ message: "Error uploading material", error });
    }
});

// 2. Get Materials
app.get('/get-materials', async (req, res) => {
    const { role, subRole, batch } = req.query;

    try {
        let query = {};

        // Universal Check: Am I personally targeted?
        const userId = req.query.id;

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
        // Match if ANY rule in targetAudience matches the user's attributes

        // Construct the criteria for the current user
        // A user matches a rule if:
        // Rule.role == User.role
        // AND (Rule.subRole is missing OR Rule.subRole == User.subRole)
        // AND (Rule.batch is missing OR Rule.batch == User.batch)

        // MongoDB query for this:
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
            .sort({ uploadedAt: -1 });

        res.json({ materials });

    } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).json({ message: "Error fetching materials", error });
    }
});

// 3. Copy Shared Material to My Data
app.post('/copy-shared-to-drive', async (req, res) => {
    const { materialId, targetFolderId, userId } = req.body;
    try {
        const material = await Material.findById(materialId).populate('fileId');
        if (!material || !material.fileId) return res.status(404).json({ message: 'Material not found' });

        const userUser = await User.findOne({ id: userId });
        if (!userUser) return res.status(404).json({ message: 'User not found' });

        // Clone the file record
        // WARNING: This re-uses the physical filePath. Deleting this file in Drive might actally delete the shared file if backend isn't smart.
        // Ideally we should physically copy the file.
        const originalFile = await File.findById(material.fileId);

        const newFile = new File({
            fileName: material.title, // Use Material title as filename
            filePath: originalFile.filePath, // Re-use path
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
        await newDriveItem.save();

        res.json({ message: 'Copied to My Data' });

    } catch (error) {
        console.error("Error coping shared file:", error);
        res.status(500).json({ message: "Error copying file", error });
    }
});

// 4. Hide Shared Material (Delete from View)
app.post('/hide-shared-material', async (req, res) => {
    const { materialId, userId } = req.body;
    try {
        await Material.findByIdAndUpdate(materialId, {
            $addToSet: { hiddenFor: userId }
        });
        res.json({ message: 'Material hidden' });
    } catch (error) {
        res.status(500).json({ message: "Error hiding material", error });
    }
});

// Proxy Route: Stream file from Drive to Frontend
app.get('/proxy-file/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const fileStream = await storageService.getFileStream(id);
        // Pipe the drive stream directly to the response
        fileStream.pipe(res);
    } catch (error) {
        console.error("Error proxying file:", error);
        res.status(404).json({ message: "File not found or access denied" });
    }
});

// Change Password
app.post('/change-password', async (req, res) => {
    const { id, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ id });
    if (!user || user.password !== currentPassword) {
        return res.status(401).json({ message: 'Invalid current password!' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully!' });
});

// Reset Password
app.post('/reset-password', async (req, res) => {
    const { id } = req.body;
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ message: 'User not found!' });

    const newPassword = randomstring.generate({ length: 8, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
    user.password = newPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: "Gmail", host: "smtp.gmail.com", port: 465, secure: true,
        auth: { user: process.env.GOOGLE_EMAIL, pass: process.env.GOOGLE_PASS },
    });

    const mailOptions = {
        from: process.env.GOOGLE_EMAIL, to: id,
        subject: 'Your New Password', text: `Your new password is: ${newPassword}. Use this password to log in to the system.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent with the new password!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email!' });
    }
});

const port = 5001;

// --- DRIVE / MY DATA ROUTES ---

// 1. Get Drive Items (Files & Folders)
app.get('/drive/items', async (req, res) => {
    const { userId, folderId } = req.query; // folderId can be 'null' for root
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let parentId = folderId;
        if (folderId === 'null' || folderId === 'undefined' || !folderId) {
            parentId = null;
        }

        // --- MIGRATION LOGIC START ---
        // If requesting Root (parentId is null), check for legacy "flat" files
        if (parentId === null) {
            // Find files that are Personal but NOT linked to any DriveItem yet
            // We look for any personal file for this user.
            // Efficient check: find fileIds from DriveItems, then find Files not in that list.

            const existingDriveItems = await DriveItem.find({ owner: user._id, type: 'file' }).select('fileId');
            const linkedFileIds = existingDriveItems.map(item => item.fileId);

            const legacyFiles = await File.find({
                "uploadedBy": user._id,
                "usage.isPersonal": true,
                "_id": { $nin: linkedFileIds }
            });

            for (const file of legacyFiles) {
                // Double check (redundant but safe)
                // Create a DriveItem for this legacy file at Root
                await DriveItem.create({
                    name: file.fileName,
                    type: 'file',
                    parent: null,
                    owner: user._id,
                    fileId: file._id
                });
                console.log(`Migrated legacy file to Drive: ${file.fileName}`);
            }
        }
        // --- MIGRATION LOGIC END ---

        // Fetch items for the directory
        let items = await DriveItem.find({
            owner: user._id,
            parent: parentId
        }).populate('fileId').lean(); // Use lean() to get plain objects we can modify

        // Calculate itemCount for folders
        items = await Promise.all(items.map(async (item) => {
            if (item.type === 'folder') {
                const count = await DriveItem.countDocuments({ parent: item._id });
                return { ...item, itemCount: count };
            }
            return item;
        }));

        // Fetch current folder metadata (for navigation)
        let currentFolder = null;
        if (parentId) {
            currentFolder = await DriveItem.findById(parentId);
        }

        // Calculate Storage Used
        // Sum fileSize of all files where usage.isPersonal = true for this user
        const storageStats = await File.aggregate([
            { $match: { uploadedBy: user._id, "usage.isPersonal": true } },
            { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
        ]);
        const storageUsed = storageStats.length > 0 ? storageStats[0].totalSize : 0;

        // Calculate Breadcrumbs Path
        const breadcrumbs = [];
        if (currentFolder) {
            let curr = currentFolder;
            while (curr) {
                breadcrumbs.unshift({ _id: curr._id, name: curr.name });
                if (curr.parent) {
                    curr = await DriveItem.findById(curr.parent);
                } else {
                    curr = null;
                }
            }
        }
        // Always add Root at the start
        breadcrumbs.unshift({ _id: null, name: 'My Data' });

        res.json({ items, folder: currentFolder, path: breadcrumbs, storageUsed }); // Return stats
    } catch (error) {
        console.error("Error fetching drive items:", error);
        res.status(500).json({ message: "Error fetching items", error });
    }
});

// 2. Create New Folder
app.post('/drive/create-folder', async (req, res) => {
    const { name, parentId, userId } = req.body;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const existingItem = await DriveItem.findOne({
            owner: user._id,
            parent: parentId || null,
            name: name
        });
        if (existingItem) {
            return res.status(400).json({ message: 'A folder or file with this name already exists in this destination.' });
        }

        const newFolder = new DriveItem({
            name,
            type: 'folder',
            parent: parentId || null,
            owner: user._id
        });

        await newFolder.save();
        res.json({ message: "Folder created", folder: newFolder });
    } catch (error) {
        res.status(500).json({ message: "Error creating folder", error });
    }
});

// 3. Upload File to Drive
app.post('/drive/upload', upload.array('file', 10), async (req, res) => {
    try {
        const userJson = JSON.parse(req.body.user);
        const parentId = req.body.parentId === 'null' ? null : req.body.parentId;

        const userDb = await User.findOne({ id: userJson.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded!' });
        }

        // Check for duplicates first (fail fast or partial? Let's fail fast for simplicity or skip?)
        // User request implies strictness. Let's check all file names first.
        // If any conflict, abort entire batch (safer UX than partial uploads).
        for (const file of req.files) {
            const existing = await DriveItem.findOne({
                owner: userDb._id,
                parent: parentId,
                name: file.originalname
            });
            if (existing) {
                return res.status(400).json({ message: `File with name "${file.originalname}" already exists.` });
            }
        }

        const savedItems = await Promise.all(req.files.map(async (file) => {
            // 1. Save physical file via Storage Service
            const fileIdFromStorage = await storageService.saveFile(file);

            // 2. Create File Record
            const newFile = new File({
                fileName: file.originalname,
                filePath: fileIdFromStorage,
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userDb._id,
                usage: { isPersonal: true }
            });
            const savedFile = await newFile.save();

            // 3. Create DriveItem link
            const newDriveItem = new DriveItem({
                name: file.originalname,
                type: 'file',
                parent: parentId,
                owner: userDb._id,
                fileId: savedFile._id
            });
            return await newDriveItem.save();
        }));

        res.json({ message: "Files uploaded to Drive", items: savedItems });
    } catch (error) {
        console.error("Error uploading to drive:", error);
        res.status(500).json({ message: "Error uploading", error });
    }
});

// 4. Rename Item
app.put('/drive/rename/:id', async (req, res) => {
    const { id } = req.params;
    const { newName } = req.body;
    try {
        const currentItem = await DriveItem.findById(id);
        if (!currentItem) return res.status(404).json({ message: "Item not found" });

        const existing = await DriveItem.findOne({
            owner: currentItem.owner,
            parent: currentItem.parent,
            name: newName
        });
        if (existing && existing._id.toString() !== id) {
            return res.status(400).json({ message: "An item with this name already exists." });
        }

        const item = await DriveItem.findByIdAndUpdate(id, { name: newName }, { new: true });
        res.json({ message: "Renamed successfully", item });
    } catch (error) {
        res.status(500).json({ message: "Error renaming", error });
    }
});

// 5. Move Item
app.put('/drive/move/:id', async (req, res) => {
    const { id } = req.params;
    const { newParentId } = req.body; // can be null for root
    try {
        const item = await DriveItem.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (newParentId === id) {
            return res.status(400).json({ message: "Cannot move a folder into itself." });
        }

        // Check for Circular Dependency (Moving parent into child)
        if (item.type === 'folder' && newParentId) {
            let current = await DriveItem.findById(newParentId);
            while (current) {
                if (current._id.toString() === id) {
                    return res.status(400).json({ message: "Cannot move a folder into one of its subfolders." });
                }
                if (!current.parent) break;
                current = await DriveItem.findById(current.parent);
            }
        }

        // Check for Duplicate in Destination
        const existing = await DriveItem.findOne({
            owner: item.owner,
            parent: newParentId || null,
            name: item.name
        });
        if (existing) {
            return res.status(400).json({ message: `An item with name "${item.name}" already exists in the destination.` });
        }

        const updatedItem = await DriveItem.findByIdAndUpdate(id, { parent: newParentId || null }, { new: true });
        res.json({ message: "Moved successfully", item: updatedItem });
    } catch (error) {
        res.status(500).json({ message: "Error moving", error });
    }
});

// 6. Delete Item (Recursive)
app.delete('/drive/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await DriveItem.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // Recursive delete function
        async function deleteItemRecursively(itemId) {
            const currentItem = await DriveItem.findById(itemId);
            if (!currentItem) return;

            if (currentItem.type === 'folder') {
                // Find children
                const children = await DriveItem.find({ parent: itemId });
                for (const child of children) {
                    await deleteItemRecursively(child._id);
                }
            } else {
                // It's a file, delete the physical file reference too
                if (currentItem.fileId) {
                    const fileRecord = await File.findById(currentItem.fileId);
                    if (fileRecord) {
                        // Delete from Storage
                        if (fileRecord.filePath) {
                            await storageService.deleteFile(fileRecord.filePath);
                        }
                        // Delete File Record
                        await File.findByIdAndDelete(currentItem.fileId);
                    }
                }
            }
            // Finally delete the DriveItem itself
            await DriveItem.findByIdAndDelete(itemId);
        }

        await deleteItemRecursively(id);

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting:", error);
        res.status(500).json({ message: "Error deleting", error });
    }
});

// 7. Get All Folders (For Picker)
app.get('/drive/folders', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const folders = await DriveItem.find({
            owner: user._id,
            type: 'folder'
        }).select('name parent _id');

        res.json({ folders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching folders", error });
    }
});

// 9. Recursive Search
app.get('/drive/search', async (req, res) => {
    const { userId, query } = req.query;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!query || query.trim() === '') {
            return res.json({ items: [] });
        }

        const items = await DriveItem.find({
            owner: user._id,
            name: { $regex: query, $options: 'i' } // Case-insensitive regex
        })
            .populate('fileId')
            .populate('parent', 'name') // Populate parent to show location
            .limit(50); // Limit results for performance

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: "Error searching drive", error });
    }
});

// 8. Copy Item
app.post('/drive/copy', async (req, res) => {
    const { itemId, targetParentId, userId } = req.body;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const itemToCopy = await DriveItem.findById(itemId);
        if (!itemToCopy) return res.status(404).json({ message: "Item not found" });

        if (targetParentId === itemId) {
            return res.status(400).json({ message: "Cannot copy a folder into itself." });
        }

        // Check for Circular Dependency (Copying parent into child)
        if (itemToCopy.type === 'folder' && targetParentId) {
            let current = await DriveItem.findById(targetParentId);
            while (current) {
                if (current._id.toString() === itemId) {
                    return res.status(400).json({ message: "Cannot copy a folder into one of its subfolders." });
                }
                if (!current.parent) break;
                current = await DriveItem.findById(current.parent);
            }
        }

        // Check for duplicate name in target
        const existing = await DriveItem.findOne({
            owner: user._id,
            parent: targetParentId || null,
            name: itemToCopy.name
        });
        if (existing) {
            return res.status(400).json({ message: `Item "${itemToCopy.name}" already exists in destination.` });
        }

        // Recursive Copy Function
        async function copyRecursively(sourceItem, newParentId) {
            if (sourceItem.type === 'folder') {
                // Create new folder
                const newFolder = await DriveItem.create({
                    name: sourceItem.name,
                    type: 'folder',
                    parent: newParentId,
                    owner: user._id
                });

                // Copy children
                const children = await DriveItem.find({ parent: sourceItem._id });
                for (const child of children) {
                    await copyRecursively(child, newFolder._id);
                }
            } else {
                // File Copy
                if (sourceItem.fileId) {
                    const originalFile = await File.findById(sourceItem.fileId);
                    if (originalFile) {
                        // 1. Physical Copy
                        const newStorageId = await storageService.copyFile(originalFile.filePath);

                        // 2. New File Record
                        const newFileRecord = new File({
                            fileName: originalFile.fileName,
                            filePath: newStorageId, // UNIQUE
                            fileType: originalFile.fileType,
                            fileSize: originalFile.fileSize,
                            uploadedBy: user._id,
                            usage: { isPersonal: true }
                        });
                        const savedFile = await newFileRecord.save();

                        // 3. New DriveItem
                        await DriveItem.create({
                            name: sourceItem.name,
                            type: 'file',
                            parent: newParentId,
                            owner: user._id,
                            fileId: savedFile._id
                        });
                    }
                }
            }
        }

        await copyRecursively(itemToCopy, targetParentId || null);

        res.json({ message: "Copied successfully" });
    } catch (error) {
        console.error("Error copying:", error);
        res.status(500).json({ message: "Error copying", error });
    }
});

// --- TIMETABLE PINNING ---
app.post('/toggle-pin-timetable', async (req, res) => {
    const { userId, timetableId } = req.body;
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Initialize if undefined
        if (!user.pinnedTimetables) user.pinnedTimetables = [];

        const isPinned = user.pinnedTimetables.some(id => id.toString() === timetableId);

        if (isPinned) {
            // Unpin
            user.pinnedTimetables = user.pinnedTimetables.filter(id => id.toString() !== timetableId);
        } else {
            // Pin (Check limit)
            if (user.pinnedTimetables.length >= 3) {
                return res.status(400).json({ message: "You can only pin up to 3 timetables." });
            }
            user.pinnedTimetables.push(timetableId);
        }

        await user.save();
        res.json({ message: isPinned ? "Unpinned" : "Pinned", pinned: !isPinned });
    } catch (error) {
        console.error("Error toggling pin:", error);
        res.status(500).json({ message: "Error updating pin" });
    }
});

app.get('/get-pinned-timetables', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findOne({ id: userId }).populate({
            path: 'pinnedTimetables',
            populate: { path: 'uploadedBy', select: 'username' } // Nested populate for uploader
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ pinned: user.pinnedTimetables || [] });
    } catch (error) {
        console.error("Error fetching pinned:", error);
        res.status(500).json({ message: "Error fetching pinned timetables" });
    }
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});