const PdfService = require('../services/PdfService');

// 1. Add PDFs
const addPdfs = async (req, res) => {
    try {
        const newPdfs = await PdfService.addPdfs(req.files, req.body);
        res.json({ message: 'PDFs added successfully!', pdfs: newPdfs });
    } catch (err) {
        console.error('Error uploading PDFs:', err);
        const status = err.message === 'No files uploaded!' ? 400 : 500;
        res.status(status).json({ message: err.message || 'Error uploading PDFs!', error: err });
    }
};

// 2. Get PDFs
const getPdfs = async (req, res) => {
    try {
        const pdfs = await PdfService.getPdfs(req.query);
        res.json({ pdfs });
    } catch (error) {
        console.error("Error fetching PDFs:", error);
        res.status(500).json({ message: 'Error fetching PDFs!', error });
    }
};

// 3. Edit PDF
const editPdf = async (req, res) => {
    try {
        const updatedPdf = await PdfService.editPdf(req.params.id, req.file, req.body);
        res.json({ message: 'PDF updated successfully!', pdf: updatedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error updating PDF!', error });
    }
};

// 4. Delete PDF
const deletePdf = async (req, res) => {
    try {
        const deletedPdf = await PdfService.deletePdf(req.params.id);
        res.json({ message: 'PDF deleted successfully!', pdf: deletedPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting PDF!', error });
    }
};

module.exports = {
    addPdfs,
    getPdfs,
    editPdf,
    deletePdf
};
