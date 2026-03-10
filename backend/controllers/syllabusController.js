const Syllabus = require('../models/Syllabus');
const StorageService = require('../services/StorageService');

// Add Syllabus Document
const addSyllabus = async (req, res) => {
    try {
        const { academicYear, branch, title, uploadedBy } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save file using unified StorageService (Drive or Local depending on env)
        const fileData = await StorageService.saveFile(req.file);

        const newSyllabus = new Syllabus({
            academicYear,
            branch,
            title,
            fileUrl: fileData.fileId, // Unified generic storage reference
            fileName: fileData.fileName,
            uploadedBy
        });

        await newSyllabus.save();
        res.status(201).json({ message: 'Syllabus uploaded successfully', syllabus: newSyllabus });
    } catch (error) {
        console.error("Error uploading syllabus:", error);
        res.status(500).json({ message: 'Error uploading syllabus', error: error.message });
    }
};

// Get All Syllabus Documents
const getSyllabusList = async (req, res) => {
    try {
        // Find all documents, sort by academic Year descending, then title ascending
        const docs = await Syllabus.find().sort({ academicYear: -1, title: 1 });
        res.status(200).json({ syllabusList: docs });
    } catch (error) {
        console.error("Error fetching syllabus:", error);
        res.status(500).json({ message: 'Error fetching syllabus documents', error: error.message });
    }
};

// Delete a Syllabus Document
const deleteSyllabus = async (req, res) => {
    try {
        const doc = await Syllabus.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }
        
        // Delete the physical file via StorageService
        await StorageService.deleteFile(doc.fileUrl);
        
        // Delete MongoDB record
        await Syllabus.findByIdAndDelete(req.params.id);

        res.json({ message: 'Syllabus deleted successfully' });
    } catch (error) {
        console.error("Error deleting syllabus:", error);
        res.status(500).json({ message: 'Error deleting syllabus', error: error.message });
    }
};

// Proxy file retrieval (Needed for uniform handling of Local & Drive downloads)
const getSyllabusFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const fileStreamData = await StorageService.getFileStream(fileId);
        
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
