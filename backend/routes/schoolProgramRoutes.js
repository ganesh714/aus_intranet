const express = require('express');
const router = express.Router();
const schoolProgramController = require('../controllers/schoolProgramController');

router.post('/add-program', schoolProgramController.addSchoolProgram);
router.get('/all-programs', schoolProgramController.getSchoolPrograms);
router.get('/program/:id', schoolProgramController.getSchoolProgramById);
router.put('/update-program/:id', schoolProgramController.updateSchoolProgram);
router.delete('/delete-program/:id', schoolProgramController.deleteSchoolProgram);

module.exports = router;
