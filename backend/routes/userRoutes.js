const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes using the exact paths from server.js to maintain compatibility
// Note: We will mount this router at '/' in server.js to keep paths like '/get-users'

// Existing routes...
router.get('/get-users', userController.getUsers);
router.get('/get-dept-faculty', userController.getDeptFaculty);
router.post('/toggle-timetable-permission', userController.toggleTimetablePermission);
router.post('/change-password', userController.changePassword);

// New Routes
router.post('/toggle-pin-timetable', userController.togglePinTimetable);
router.get('/get-pinned-timetables', userController.getPinnedTimetables);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
