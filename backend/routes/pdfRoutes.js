const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const pdfController = require('../controllers/pdfController');
// Note: We can add authMiddleware here strictly if desired, but duplicating server.js logic first.

router.post('/add-pdf', upload.array('file', 10), pdfController.addPdfs);
router.get('/get-pdfs', pdfController.getPdfs);
router.put('/edit-pdf/:id', upload.single('file'), pdfController.editPdf);
router.delete('/delete-pdf/:id', pdfController.deletePdf);

module.exports = router;
