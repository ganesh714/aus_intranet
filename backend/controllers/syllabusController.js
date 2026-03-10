const SyllabusService = require('../services/SyllabusService');

// Add Syllabus Document
const addSyllabus = async (req, res) => {
    try {
        const newSyllabus = await SyllabusService.addSyllabus(req.file, req.body);
        res.status(201).json({ message: 'Syllabus uploaded successfully', syllabus: newSyllabus });
    } catch (error) {
        console.error("Error uploading syllabus:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error uploading syllabus', error: error.message });
    }
};

// Get All Syllabus Documents
const getSyllabusList = async (req, res) => {
    try {
        const docs = await SyllabusService.getSyllabusList();
        res.status(200).json({ syllabusList: docs });
    } catch (error) {
        console.error("Error fetching syllabus:", error);
        res.status(500).json({ message: 'Error fetching syllabus documents', error: error.message });
    }
};

// Delete a Syllabus Document
const deleteSyllabus = async (req, res) => {
    try {
        await SyllabusService.deleteSyllabus(req.params.id);
        res.json({ message: 'Syllabus deleted successfully' });
    } catch (error) {
        console.error("Error deleting syllabus:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error deleting syllabus', error: error.message });
    }
};

// Proxy file retrieval (Needed for uniform handling of Local & Drive downloads)
const getSyllabusFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const fileStreamData = await SyllabusService.getSyllabusFileStream(fileId);
        
        // Setting generic headers, let browser handle the application/pdf representation
        res.setHeader('Content-Type', fileStreamData.mimeType || 'application/pdf');
        
        fileStreamData.stream.pipe(res);
    } catch (error) {
        console.error("Error streaming syllabus file:", error);
        res.status(500).send('Error retrieving file');
    }
};

module.exports = {
    addSyllabus,
    getSyllabusList,
    deleteSyllabus,
    getSyllabusFile
};
