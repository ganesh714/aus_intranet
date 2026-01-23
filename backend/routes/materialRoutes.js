const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const materialController = require('../controllers/materialController');

router.post('/add-material', upload.single('file'), materialController.addMaterial);
router.get('/get-materials', materialController.getMaterials);
router.post('/copy-shared-to-drive', materialController.copySharedToDrive);
router.post('/hide-shared-material', materialController.hideSharedMaterial);

module.exports = router;
