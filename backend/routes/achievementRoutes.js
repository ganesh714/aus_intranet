const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const multer = require('multer');

// Configure Multer (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/get-achievements', achievementController.getAchievements);
router.post('/add-achievement', upload.single('proof'), achievementController.addAchievement);
router.put('/update-achievement-status', achievementController.updateAchievementStatus);

module.exports = router;
