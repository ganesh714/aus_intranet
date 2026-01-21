const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Basic config

const timetableController = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// CHAIN OF RESPONSIBILITY:
// 1. Upload (Multer) -> 2. Protect (Auth) -> 3. Controller
router.post('/add-timetable',
    upload.single('file'),
    protect,
    // restrict to Faculty/HOD/Admin if needed, e.g.: authorize('Faculty', 'HOD', 'Admin'),
    timetableController.addTimetable
);

router.get('/get-timetables', timetableController.getTimetables);

module.exports = router;
