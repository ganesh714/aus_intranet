const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Define routes using the exact paths from server.js to maintain compatibility
// Note: We will mount this router at '/' in server.js to keep paths like '/get-users'
const middleware = require('../middleware/authMiddleware');
console.log('AUTH MIDDLEWARE EXPORT:', middleware);

const protect = middleware.protect;
console.log('PROTECT IS:', protect);

// Existing routes...
router.get('/get-users', userController.getUsers);
router.get('/get-dept-faculty', userController.getDeptFaculty);
router.post('/toggle-timetable-permission', userController.toggleTimetablePermission);

router.post('/toggle-achievement-permission', userController.toggleAchievementPermission); // [NEW]



//router.put('/change-password',protect, userController.changePassword);


router.post('/toggle-workshop-permission', userController.toggleWorkshopPermission); // [NEW]
router.post('/change-password', userController.changePassword);


// New Routes
router.post('/toggle-pin-timetable', userController.togglePinTimetable);
router.get('/get-pinned-timetables', userController.getPinnedTimetables);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
