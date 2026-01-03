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
        const { title, subject, targetBatch, targetDepartments } = req.body;
        const user = JSON.parse(req.body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

        // Parse targetDepartments if it's sent as a JSON string (common with FormData)
        let departments = targetDepartments;
        if (typeof targetDepartments === 'string') {
            try {
                departments = JSON.parse(targetDepartments);
            } catch (e) {
                // If not JSON, assume single string and wrap in array
                departments = [targetDepartments];
            }
        }

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
            targetBatch,
            targetDepartments: departments,
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

        if (role === 'Student') {
            // Student Logic: Show materials if:
            // 1. Target Batch matches student's batch (if provided)
            // 2. AND (Target Departments includes student's dept OR Uploaded by student's faculty)

            if (batch) query.targetBatch = batch;

            if (subRole) { // Student's department
                // Find faculty of this department to support legacy "UploadedBy" check
                const facultyUsers = await User.find({ subRole }).select('_id');
                const facultyIds = facultyUsers.map(u => u._id);

                query.$or = [
                    { targetDepartments: { $in: [subRole] } }, // Explicit sharing
                    { uploadedBy: { $in: facultyIds } }       // Legacy/Implicit sharing
                ];
            }

        } else {
            // Faculty/HOD Logic: Show materials if:
            // 1. They uploaded it
            // 2. OR It is shared with their department

            if (subRole && subRole !== 'All' && subRole !== 'null') {
                const users = await User.find({ subRole }).select('_id');
                const userIds = users.map(u => u._id);

                query.$or = [
                    { targetDepartments: { $in: [subRole] } },
                    { uploadedBy: { $in: userIds } }
                ];
            }
            if (batch) query.targetBatch = batch;
        }

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
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});