const express = require('express');
const router = express.Router();
const fdpSttpAttendedController = require('../controllers/fdpSttpAttendedController');

router.post('/add-fdp-sttp-attended', fdpSttpAttendedController.addFdpSttp);
router.get('/get-fdp-sttp-attended', fdpSttpAttendedController.getFdpSttps);
router.delete('/delete-fdp-sttp-attended/:id', fdpSttpAttendedController.deleteFdpSttp);
router.put('/update-fdp-sttp-attended/:id', fdpSttpAttendedController.updateFdpSttp);

module.exports = router;
