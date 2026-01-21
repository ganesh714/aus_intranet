// backend/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/get-announcements', announcementController.getAnnouncements);
router.post('/add-announcement', upload.single('file'), announcementController.addAnnouncement);

module.exports = router;