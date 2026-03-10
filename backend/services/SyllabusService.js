const Syllabus = require('../models/Syllabus');
const StorageService = require('./StorageService');

class SyllabusService {
    static async addSyllabus(file, data) {
        if (!file) {
            const error = new Error('No file uploaded');
            error.statusCode = 400;
            throw error;
        }

        const { batch, branch, title, uploadedBy } = data;

        // Save file using unified StorageService (Drive or Local depending on env)
        const fileId = await StorageService.saveFile(file);

        const newSyllabus = new Syllabus({
            batch,
            branch,
            title,
            fileUrl: fileId, // Unified generic storage reference
            fileName: file.originalname,
            uploadedBy
        });

        await newSyllabus.save();
        return newSyllabus;
    }

    static async getSyllabusList() {
        // Find all documents, sort by batch descending, then title ascending
        const docs = await Syllabus.find().sort({ batch: -1, title: 1 });
        return docs;
    }

    static async deleteSyllabus(id) {
        const doc = await Syllabus.findById(id);
        if (!doc) {
            const error = new Error('Syllabus not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Delete the physical file via StorageService
        await StorageService.deleteFile(doc.fileUrl);
        
        // Delete MongoDB record
        await Syllabus.findByIdAndDelete(id);
        return true;
    }

    static async getSyllabusFileStream(fileId) {
        return await StorageService.getFileStream(fileId);
    }
}

module.exports = SyllabusService;
