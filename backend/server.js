const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const Announcement = require('./models/Announcement'); // Import your Announcement model

const app = express();

// Enable CORS and parse incoming requests
app.use(cors());
app.use(bodyParser.json());

// Serve the 'uploads' folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up file storage configuration using Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        cb(null, uploadDir); // The directory where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid name collisions
    },
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

// Define User Schema with subRole field
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    subRole: {
        type: String,
        enum: [
            'DyPC', 'VC', 'ProVC', 'Registrar',  // sub-roles for Officers
            'IQAC', 'R&C', 'ADMIN', 'CD', 'SA', 'IR', 'AD', 'SOE', 'COE','SOP',         // sub-roles for Dean
            'SOE', 'IQAC', 'AD','FED',       // sub-roles for Asso.Dean
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE','ECE', 'Ag.E', 'MPE', 'FED', // sub-roles for HOD
            'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE','ECE', 'Ag.E', 'MPE', 'FED' // sub-roles for Faculty
        ],
        default: null,  // subRole can be null if it's not relevant for the role
    },
});

const User = mongoose.model('User', userSchema);

// Define PDF Schema
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

// User Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password, role, subRole } = req.body;

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if a user with the same role and subRole exists (for roles other than 'Faculty' and 'Admin')
    if (role !== 'Faculty' && role !== 'Admin') {
        const existingUserByRoleAndSubRole = await User.findOne({ role, subRole });
        if (existingUserByRoleAndSubRole) {
            return res.status(400).json({ message: 'User with this role and subRole already exists' });
        }
    }

    // Ensure subRole is provided for 'Faculty'
    if (role === 'Faculty' && !subRole) {
        return res.status(400).json({ message: 'subRole (department) is required for Faculty' });
    }

    // Create a new user, including the subRole if provided
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



// User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password === password) {
        // Return the user information including subRole
        res.json({ message: 'Login successful!', user });
    } else {
        res.status(401).json({ message: 'Invalid credentials!' });
    }
});

app.use(bodyParser.json());


// Add PDF Route for uploading multiple PDFs
app.post('/add-pdf', upload.array('file', 10), async (req, res) => {
    //console.log('Request received: ', req.body); // Log the request body
    //console.log('Files uploaded: ', req.files); // Log the uploaded files


    const { category, name, user, subCategory } = req.body;

    // Ensure category and name are arrays
    const categories = Array.isArray(category) ? category : [category];
    const subcategorys = Array.isArray(subCategory) ? subCategory : [subCategory];
    const names = Array.isArray(name) ? name : [name];

    // Parse user data correctly for each file
    const users = Array.isArray(user) ? user.map(u => JSON.parse(u)) : [JSON.parse(user)];

    const filePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

    if (filePaths.length === 0) {
        return res.status(400).json({ message: 'No files uploaded!' });
    }

    try {
        const newPdfs = await Promise.all(
            filePaths.map(async (filePath, index) => {
                const categoryForFile = categories[index];
                const nameForFile = names[index];
                const userForFile = users[index];
                const subcategoryForFile = subcategorys[index]

                console.log(subcategoryForFile)
                console.log(subcategorys)
                console.log(subCategory)

                const newPdf = new Pdf({
                    category: categoryForFile,
                    subcategory: subcategoryForFile,
                    name: nameForFile,
                    filePath: filePath,
                    uploadedBy: {
                        username: userForFile.username,
                        role: userForFile.role,
                        subRole: userForFile.subRole,
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





// Get PDFs based on Role and SubRole
app.get('/get-pdfs', async (req, res) => {
    const { role, subRole } = req.query;

    try {
        const query = {};
        if (role) query['uploadedBy.role'] = role;
        if (subRole) query['uploadedBy.subRole'] = subRole;

        const pdfsSet = new Map();

        // Fetch PDFs uploaded by the user role/subRole
        const initialPdfs = await Pdf.find(query);
        initialPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));

        // Define extra categories based on role
        const extraCategories = [];

        if (role === 'Officers') {
            extraCategories.push(
                'University related',
                "Dean's related",
                "Asso.Dean's related",
                "HOD's related",
                'Faculty related',
                'Dept.Equipment'
            );
        } else if (role === 'Dean') {
            extraCategories.push(
                "Dean's related",
                "Asso.Dean's related",
                "HOD's related",
                'Faculty related',
                'Dept.Equipment'
            );

        } else if (role === 'Asso.Dean') {
            extraCategories.push(
                "Asso.Dean's related",
                "HOD's related",
                'Faculty related',
                'Dept.Equipment'
            );

        } else if (role === 'HOD') {
            extraCategories.push(
                "HOD's related",
                'Faculty related',
                'Dept.Equipment',
                `Teaching Material`,
                `Staff Presentations`
                // `Department ${subRole} related`
            );

        } else if (role === 'Faculty') {
            extraCategories.push(
                'Faculty related',
                'Dept.Equipment',
                `Teaching Material`,
                `Staff Presentations`
                // `Department ${subRole} related`

            );
        }

        // Fetch and add extra PDFs by category
        if (extraCategories.length > 0) {
            const extraPdfs = await Pdf.find({ category: { $in: extraCategories } });
            extraPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
        }

        const uniquePdfs = Array.from(pdfsSet.values());

        res.json({ pdfs: uniquePdfs });

        // If you want to return file URLs for frontend use, use this instead:
        // res.json({
        //     pdfs: uniquePdfs.map(pdf => ({
        //         ...pdf.toObject(),
        //         fileUrl: `http://localhost:5000/uploads/${pdf.fileName}`
        //     }))
        // });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs!', error });
    }
});



// Get Announcements based on Role and SubRole
app.get('/get-announcements', async (req, res) => {
    const { role, subRole } = req.query;
    // console.log(role, subRole)
    try {
        const query = {};
        if (role) query['uploadedBy.role'] = role;
        if (subRole) query['uploadedBy.subRole'] = subRole;

        // Fetch announcements based on role and subRole
        const announcements = await Announcement.find(query);

        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements!', error });
    }
});


app.post('/add-announcement', upload.single('file'), async (req, res) => {
    const { title, description } = req.body;
    const user = JSON.parse(req.body.user);
    const { username, role, subRole } = user;

    // Save the announcement data
    const newAnnouncement = new Announcement({
        title,
        description,
        filePath: req.file ? req.file.path : null,
        uploadedBy: {
            username,
            role,
            subRole,
        },
    });

    try {
        await newAnnouncement.save();
        res.status(200).json({ message: 'Announcement uploaded successfully!', announcement: newAnnouncement });
    } catch (error) {
        console.error('Error saving announcement:', error);
        res.status(500).json({ message: 'Error uploading announcement', error });
    }
});



// Edit PDF Route for updating PDF details
app.put('/edit-pdf/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { category, name } = req.body;
    const updatedFields = { category, name };

    if (req.file) {
        updatedFields.filePath = req.file.path;
    }

    try {
        const updatedPdf = await Pdf.findByIdAndUpdate(id, updatedFields, { new: true });
        res.json({ message: 'PDF updated successfully!', pdf: updatedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error updating PDF!', error });
    }
});


// Edit Announcement Route for updating announcement details
app.put('/edit-announcement/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Prepare the fields to be updated
    const updatedFields = { title, description };

    // Check if a new file has been uploaded and update the filePath
    if (req.file) {
        updatedFields.filePath = req.file.path;  // Store the new file path
    }

    try {
        // Find the announcement by ID and update it with the Teaching Material
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updatedFields, { new: true });

        // If no announcement was found with that ID
        if (!updatedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Return success response with the updated announcement
        res.json({ message: 'Announcement updated successfully!', announcement: updatedAnnouncement });
    } catch (error) {
        // Return error response if there is a problem updating
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Error updating announcement!', error });
    }
});


// Delete PDF Route
app.delete('/delete-pdf/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPdf = await Pdf.findByIdAndDelete(id);
        res.json({ message: 'PDF deleted successfully!', pdf: deletedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting PDF!', error });
    }
});

// Change Password Route
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

// Password Reset Request Route
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    // Generate a random password
    const newPassword = randomstring.generate({
        length: 8, // Password length
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // Password containing numbers and letters
    });

    // Update the user's password with the generated random password
    user.password = newPassword;
    await user.save();

    // Configure Mailtrap transporter
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GOOGLE_EMAIL,
            pass: process.env.GOOGLE_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GOOGLE_EMAIL, // Sender email
        to: email, // Recipient email
        subject: 'Your New Password',
        text: `Your new password is: ${newPassword}. Use this password to log in to the system.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent with the new password!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email!' });
    }
});

// Start the server
const port = 5001;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
