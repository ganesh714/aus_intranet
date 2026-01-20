const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Basic config

const timetableController = require('../controllers/timetableController');

// Define the route
router.post('/add-timetable', upload.single('file'), timetableController.addTimetable);

module.exports = router;