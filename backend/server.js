const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const File = require('./models/File');
const Material = require('./models/Material'); // Import the new model
const Announcement = require('./models/Announcement');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

const userSchema = new mongoose.Schema({
    username: String,
    id: String,
    password: String,
    role: String,
    subRole: {
        type: String,
        enum: [
            'DyPC', 'VC', 'ProVC', 'Registrar',
            'IQAC', 'R&C', 'ADMIN', 'CD', 'SA', 'IR', 'AD', 'SOE', 'COE', 'SOP',
            'SOE', 'IQAC', 'AD', 'FED',
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED',
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'
        ],
        default: null,
    },
});

const User = mongoose.model('User', userSchema);

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
    const { username, id, password, role, subRole } = req.body;

    const existingUserById = await User.findOne({ id });
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
        id,
        password,
        role,
        subRole: role === 'Admin' ? null : subRole,
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
    const user = await User.findOne({ id });

    if (user && user.password === password) {
        res.json({ message: 'Login successful!', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials!' });
    }
});

// Add PDF Route
app.post('/add-pdf', upload.array('file', 10), async (req, res) => {
    const { category, name, user, subCategory } = req.body;

    const categories = Array.isArray(category) ? category : [category];
    const subcategorys = Array.isArray(subCategory) ? subCategory : [subCategory];
    const names = Array.isArray(name) ? name : [name];
    const users = Array.isArray(user) ? user.map(u => JSON.parse(u)) : [JSON.parse(user)];
    const filePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

    if (filePaths.length === 0) {
        return res.status(400).json({ message: 'No files uploaded!' });
    }

    try {
        const newPdfs = await Promise.all(
            filePaths.map(async (filePath, index) => {
                const userObj = users[index];
                const dbUser = await User.findOne({ id: userObj.id }); // Find user by custom ID
                if (!dbUser) throw new Error(`User not found: ${userObj.id}`);

                const newPdf = new Pdf({
                    category: categories[index],
                    subcategory: subcategorys[index],
                    name: names[index],
                    filePath: filePath,
                    uploadedBy: dbUser._id, // Save ObjectId
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

// Get PDFs Route (Corrected for Student)
app.get('/get-pdfs', async (req, res) => {
    const { role, subRole } = req.query;

    try {
        const query = {};
        if (role) query['uploadedBy.role'] = role;
        if (subRole) query['uploadedBy.subRole'] = subRole;

        const pdfsSet = new Map();

        // Students don't see their own uploads (they don't upload), so skip this block for them
        if (role !== 'Student') {
            // Find users matching query first
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

        if (role === 'Officers' || role === 'Leadership') {
            extraCategories.push('University related', "Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Dean') {
            extraCategories.push("Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Asso.Dean') {
            extraCategories.push("Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'HOD') {
            extraCategories.push("HOD's related", 'Faculty related', 'Dept.Equipment', 'Staff Presentations');
        } else if (role === 'Faculty') {
            extraCategories.push('Faculty related', 'Dept.Equipment', 'Staff Presentations');
        } else if (role === 'Student') {
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

        // 1. Fetch my own uploaded announcements (so I can see what I sent)
        if (id) {
            const user = await User.findOne({ id });
            if (user) {
                orConditions.push({ 'uploadedBy': user._id });
            }
        }

        // 2. Fetch announcements targeting ME (My Role & My Dept)
        if (role) {
            // Find announcements where targetAudience array contains an element matching my role/subRole
            if (subRole && subRole !== 'null') {
                orConditions.push({
                    targetAudience: {
                        $elemMatch: {
                            $or: [
                                { role: role, subRole: subRole },
                                { role: role, subRole: 'All' }
                            ]
                        }
                    }
                });
            } else {
                // If I have no subRole, check if there is a target with my role
                orConditions.push({
                    targetAudience: {
                        $elemMatch: { role: role }
                    }
                });
            }
        }

        // --- THE FIX: ALWAYS FETCH GLOBAL ANNOUNCEMENTS ---
        // This checks if there is ANY target with role 'All' in the array
        orConditions.push({
            targetAudience: {
                $elemMatch: { role: 'All' }
            }
        });

        if (orConditions.length === 0) return res.json({ announcements: [] });

        const query = { $or: orConditions };

        // Ensure you use .populate() if you are using the new File schema
        const announcements = await Announcement.find(query)
            .populate('fileId')
            .populate('uploadedBy', 'username role')
            .sort({ uploadedAt: -1 });

        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements!', error });
    }
});

// Add Announcement
app.post('/add-announcement', upload.single('file'), async (req, res) => {
    const { title, description, targetRole, targetSubRole } = req.body;
    const user = JSON.parse(req.body.user);
    const userDb = await User.findOne({ id: user.id });
    if (!userDb) return res.status(404).json({ message: 'User not found' });

    let savedFileId = null;

    // 1. If a physical file was uploaded, create a File entry first
    if (req.file) {
        const newFile = new File({
            fileName: req.file.originalname,
            filePath: req.file.path.replace(/\\/g, '/'),
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: userDb._id,
            usage: { isAnnouncement: true } // Flag this as an announcement file
        });

        const savedFile = await newFile.save();
        savedFileId = savedFile._id; // Capture the ID
    }

    // 2. Create the Announcement referencing the File ID
    // Parse targets if it came as a stringified JSON (common with FormData)
    let targets = [];
    try {
        targets = typeof req.body.targets === 'string' ? JSON.parse(req.body.targets) : req.body.targets;
    } catch (e) {
        console.error("Error parsing targets:", e);
        targets = []; // Fallback
    }

    const newAnnouncement = new Announcement({
        title,
        description,
        fileId: savedFileId, // Link via ID, not path
        uploadedBy: userDb._id,
        targetAudience: targets // Save the array
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
    if (req.file) updatedFields.filePath = req.file.path;

    try {
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
    if (req.file) updatedFields.filePath = req.file.path;

    try {
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

        // Fetch files where the user is the owner AND isPersonal flag is true
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
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded!' });
        }

        const savedFiles = await Promise.all(files.map(async (file, index) => {
            const newFile = new File({
                fileName: names[index] || file.originalname, // Use provided name or original
                filePath: file.path.replace(/\\/g, '/'),
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userDb._id,
                // CRITICAL: Set the Personal flag to true
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
        // Removed 'type' from destructuring
        const { title, subject, targetYear, targetSection } = req.body;
        const user = JSON.parse(req.body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) return res.status(404).json({ message: 'User not found' });

        if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

        const newFile = new File({
            fileName: req.file.originalname,
            filePath: req.file.path.replace(/\\/g, '/'),
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: userDb._id,
            usage: { isDeptDocument: true }
        });
        const savedFile = await newFile.save();

        const newMaterial = new Material({
            // Removed 'type'
            title,
            subject,
            targetYear,
            targetSection,
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
    // Removed 'type' from query
    const { role, subRole, year, section } = req.query;

    try {
        let query = {};

        if (role === 'Student') {
            if (subRole) {
                const facultyUsers = await User.find({ subRole }).select('_id');
                const facultyIds = facultyUsers.map(u => u._id);
                if (facultyIds.length > 0) query['uploadedBy'] = { $in: facultyIds };
            }
            if (year) query.targetYear = year;
            if (section) query.targetSection = section;
        } else {
            // Faculty/Leadership viewing logic
            if (subRole && subRole !== 'All' && subRole !== 'null') {
                // Find users with this subRole
                const users = await User.find({ subRole }).select('_id');
                const userIds = users.map(u => u._id);
                if (userIds.length > 0) {
                    query['uploadedBy'] = { $in: userIds };
                } else {
                    return res.json({ materials: [] }); // No users found, so no materials
                }
            }
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