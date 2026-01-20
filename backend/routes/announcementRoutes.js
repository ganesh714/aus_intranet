// backend/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

router.get('/get-announcements', announcementController.getAnnouncements);

module.exports = router;