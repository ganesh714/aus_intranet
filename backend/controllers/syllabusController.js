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
        const stream = await SyllabusService.getSyllabusFileStream(fileId);

        // Setting generic headers for PDF
        res.setHeader('Content-Type', 'application/pdf');

        stream.pipe(res);
    } catch (error) {
        console.error("Error streaming syllabus file:", error);
        res.status(500).send('Error retrieving file');
    }
};

// Update Syllabus Title
const updateSyllabusTitle = async (req, res) => {
    try {
        const { title } = req.body;
        const updatedDoc = await SyllabusService.updateSyllabusTitle(req.params.id, title);
        res.status(200).json({ message: 'Syllabus title updated successfully', syllabus: updatedDoc });
    } catch (error) {
        console.error("Error updating syllabus title:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error updating syllabus title', error: error.message });
    }
};

module.exports = {
    addSyllabus,
    getSyllabusList,
    deleteSyllabus,
    updateSyllabusTitle,
    getSyllabusFile
};
