const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect

// Define routes using the exact paths from server.js to maintain compatibility
// Note: We will mount this router at '/' in server.js to keep paths like '/get-users'

// Existing routes...
router.get('/get-users', userController.getUsers);
router.get('/get-dept-faculty', userController.getDeptFaculty);
router.post('/toggle-timetable-permission', userController.toggleTimetablePermission);
router.post('/toggle-achievement-permission', userController.toggleAchievementPermission);
router.post('/toggle-workshop-permission', userController.toggleWorkshopPermission);
router.post('/toggle-guest-lecture-permission', userController.toggleGuestLecturePermission);
router.post('/toggle-industrial-visit-permission', userController.toggleIndustrialVisitPermission);
router.post('/toggle-fdp-pdp-permission', userController.toggleFdpPdpPermission);
router.post('/toggle-fdp-sttp-permission', userController.toggleFdpSttpPermission);
router.post('/change-password', protect, userController.changePassword);

// Admin-only routes
router.get('/admin/get-all-users', userController.getAllUsers);
router.post('/admin/toggle-special-permission', userController.toggleSpecialPermission);

// New Routes
router.post('/toggle-pin-timetable', userController.togglePinTimetable);
router.get('/get-pinned-timetables', userController.getPinnedTimetables);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
