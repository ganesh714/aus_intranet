const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer with MemoryStorage to pass the buffer directly to generic StorageService
const upload = multer({ storage: multer.memoryStorage() });
const syllabusController = require('../controllers/syllabusController');

router.post('/add-syllabus', upload.single('file'), syllabusController.addSyllabus);
router.get('/get-syllabus', syllabusController.getSyllabusList);
router.delete('/delete-syllabus/:id', syllabusController.deleteSyllabus);
router.put('/update-syllabus-title/:id', syllabusController.updateSyllabusTitle);
router.get('/proxy-syllabus/:fileId', syllabusController.getSyllabusFile);

module.exports = router;
