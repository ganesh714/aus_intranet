const express = require('express');
const router = express.Router();
const industrialVisitController = require('../controllers/industrialVisitController');

router.post('/add-industrial-visit', industrialVisitController.addVisit);
router.get('/get-industrial-visits', industrialVisitController.getVisits);
router.delete('/delete-industrial-visit/:id', industrialVisitController.deleteVisit);
router.put('/update-industrial-visit/:id', industrialVisitController.updateVisit);

module.exports = router;
