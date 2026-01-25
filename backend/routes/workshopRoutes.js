const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

router.post('/add-workshop', workshopController.addWorkshop);
router.get('/get-workshops', workshopController.getWorkshops);
router.delete('/delete-workshop/:id', workshopController.deleteWorkshop);
router.put('/update-workshop/:id', workshopController.updateWorkshop);

module.exports = router;
