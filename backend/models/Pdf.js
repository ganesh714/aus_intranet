const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
        username: { type: String, required: true },
        role: { type: String, required: true },
        subRole: { type: String, default: null },
    },
});


const Pdf = mongoose.model('Pdf', pdfSchema);
module.exports = Pdf;
