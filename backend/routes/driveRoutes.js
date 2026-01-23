const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const driveController = require('../controllers/driveController');

// Drive Core
router.get('/drive/items', driveController.getDriveItems);
router.post('/drive/create-folder', driveController.createFolder);
router.post('/drive/upload', upload.array('file', 10), driveController.uploadFiles);
router.put('/drive/rename/:id', driveController.renameItem);
router.put('/drive/move/:id', driveController.moveItem);
router.delete('/drive/delete/:id', driveController.deleteItem);
router.get('/drive/folders', driveController.getFolders);
router.post('/drive/copy', driveController.copyItem);
router.get('/drive/search', driveController.searchDrive);

// Legacy / Helper
router.get('/get-personal-files', driveController.getPersonalFiles);
router.post('/upload-personal-file', upload.array('file', 10), driveController.uploadPersonalFile);
router.get('/proxy-file/:id', driveController.proxyFile);

module.exports = router;
