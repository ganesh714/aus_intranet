const express = require('express');
const router = express.Router();
const fdpPdpOrganizedController = require('../controllers/fdpPdpOrganizedController');

router.post('/add-fdp-pdp-organized', fdpPdpOrganizedController.addFdpPdp);
router.get('/get-fdp-pdp-organized', fdpPdpOrganizedController.getFdpPdps);
router.delete('/delete-fdp-pdp-organized/:id', fdpPdpOrganizedController.deleteFdpPdp);
router.put('/update-fdp-pdp-organized/:id', fdpPdpOrganizedController.updateFdpPdp);

module.exports = router;
