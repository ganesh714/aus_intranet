const express = require('express');
const router = express.Router();
const guestLectureController = require('../controllers/guestLectureController');

router.post('/add-guest-lecture', guestLectureController.addLecture);
router.get('/get-guest-lectures', guestLectureController.getLectures);
router.delete('/delete-guest-lecture/:id', guestLectureController.deleteLecture);
router.put('/update-guest-lecture/:id', guestLectureController.updateLecture);

module.exports = router;
