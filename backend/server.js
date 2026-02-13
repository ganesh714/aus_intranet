
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import connectDB from "./config/db.js";
import routes from "./routes/routes.js";

// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const userRoutes = require('./routes/userRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const materialRoutes = require('./routes/materialRoutes');
const driveRoutes = require('./routes/driveRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// Import Services
const emailService = require('./services/EmailService');
// Initialize Services
emailService.init();


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api", routes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on ${port}`));

// Note: 'uploads' static folder is no longer needed for drive, but kept if you have legacy files.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/dashboard', dashboardRoutes);

// --- MULTER CONFIG (Memory Storage for Cloud Uploads) ---
// --- MULTER CONFIG ---
// Routes now handle their own multer configuration


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });


// --- USER ROUTES ---
app.use('/', userRoutes); // Mounted at root to preserve /get-users paths


// --- PDF ROUTES ---
app.use('/', pdfRoutes); // Mounted at root


// edit-pdf and delete-pdf routes moved to pdfRoutes


// --- DRIVE ROUTES ---
app.use('/', driveRoutes); // Mounted at root to preserve routes

// --- MATERIAL ROUTES ---
app.use('/', materialRoutes); // Mounted at root to preserve routes
app.use('/', achievementRoutes);

app.use('/auth', authRoutes);
app.use('/', timetableRoutes);
app.use('/', announcementRoutes);
app.use('/', require('./routes/workshopRoutes')); // [NEW] Workshop Endpoints
app.use('/', require('./routes/subRoleRoutes')); // [NEW] SubRole Endpoints

const port = process.env.PORT || 5001;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

