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
    email: String,
    password: String,
    role: String,
    subRole: {
        type: String,
        enum: [
            'DyPC', 'VC', 'ProVC', 'Registrar',  
            'IQAC', 'R&C', 'ADMIN', 'CD', 'SA', 'IR', 'AD', 'SOE', 'COE','SOP',         
            'SOE', 'IQAC', 'AD','FED',       
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE','ECE', 'Ag.E', 'MPE', 'FED', 
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE','ECE', 'Ag.E', 'MPE', 'FED'  
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
    uploadedBy: {
        username: { type: String, required: true },
        role: { type: String, required: true },
        subRole: { type: String },
    },
});

const Pdf = mongoose.model('Pdf', pdfSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { username, email, password, role, subRole } = req.body;

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
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
        email,
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });

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
                const newPdf = new Pdf({
                    category: categories[index],
                    subcategory: subcategorys[index],
                    name: names[index],
                    filePath: filePath,
                    uploadedBy: {
                        username: users[index].username,
                        role: users[index].role,
                        subRole: users[index].subRole,
                    },
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
            const initialPdfs = await Pdf.find(query);
            initialPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
        }

        const extraCategories = [];

        if (role === 'Officers' || role === 'Leadership') {
            extraCategories.push('University related', "Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Dean') {
            extraCategories.push("Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Asso.Dean') {
            extraCategories.push("Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'HOD') {
            extraCategories.push("HOD's related", 'Faculty related', 'Dept.Equipment', 'Teaching Material', 'Staff Presentations', 'Time Table');
        } else if (role === 'Faculty') {
            extraCategories.push('Faculty related', 'Dept.Equipment', 'Teaching Material', 'Staff Presentations', 'Time Table');
        } else if (role === 'Student') {
            // UPDATED: Student only sees these
            extraCategories.push('Teaching Material', 'Time Table');
        }

        if (extraCategories.length > 0) {
            const extraPdfs = await Pdf.find({ category: { $in: extraCategories } });
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
    const { role, subRole, email } = req.query;
    try {
        const orConditions = [];

        // 1. Fetch my own uploaded announcements (so I can see what I sent)
        if (email) {
            orConditions.push({ 'uploadedBy.email': email });
        }
        
        // 2. Fetch announcements targeting ME (My Role & My Dept)
        if (role) {
            if (subRole && subRole !== 'null') {
                orConditions.push(
                    // Targeted specifically to my Role & Dept (e.g., Student - CSE)
                    { 'targetAudience.role': role, 'targetAudience.subRole': subRole },
                    // Targeted to my Role generally (e.g., Student - All)
                    { 'targetAudience.role': role, 'targetAudience.subRole': 'All' }
                );
            } else {
                // If I have no subRole, just check my main role
                orConditions.push({ 'targetAudience.role': role });
            }
        }

        // --- THE FIX: ALWAYS FETCH GLOBAL ANNOUNCEMENTS ---
        // This ensures announcements sent to "All" (by DyPC/Leadership) are seen by everyone.
        orConditions.push({ 'targetAudience.role': 'All' });

        if (orConditions.length === 0) return res.json({ announcements: [] });

        const query = { $or: orConditions };

        // Ensure you use .populate() if you are using the new File schema
        const announcements = await Announcement.find(query)
            .populate('fileId') 
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
    
    let savedFileId = null;

    // 1. If a physical file was uploaded, create a File entry first
    if (req.file) {
        const newFile = new File({
            fileName: req.file.originalname,
            filePath: req.file.path.replace(/\\/g, '/'),
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: {
                username: user.username,
                email: user.email,
                role: user.role
            },
            usage: { isAnnouncement: true } // Flag this as an announcement file
        });
        
        const savedFile = await newFile.save();
        savedFileId = savedFile._id; // Capture the ID
    }

    // 2. Create the Announcement referencing the File ID
    const newAnnouncement = new Announcement({
        title, 
        description, 
        fileId: savedFileId, // Link via ID, not path
        uploadedBy: { 
            username: user.username, 
            email: user.email, 
            role: user.role, 
            subRole: user.subRole 
        },
        targetAudience: { role: targetRole, subRole: targetSubRole }
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


// Change Password
app.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== currentPassword) {
        return res.status(401).json({ message: 'Invalid current password!' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully!' });
});

// Reset Password
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found!' });

    const newPassword = randomstring.generate({ length: 8, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
    user.password = newPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: "Gmail", host: "smtp.gmail.com", port: 465, secure: true,
        auth: { user: process.env.GOOGLE_EMAIL, pass: process.env.GOOGLE_PASS },
    });

    const mailOptions = {
        from: process.env.GOOGLE_EMAIL, to: email,
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