const Pdf = require('../models/Pdf');
const User = require('../models/User');
const storageService = require('./storageService');

class PdfService {

    // 1. Add PDFs (Batch Upload)
    static async addPdfs(files, body) {
        // Parse incoming body fields which might be strings or arrays
        const { category, name, user, subCategory } = body;

        const categories = Array.isArray(category) ? category : [category];
        const subcategorys = Array.isArray(subCategory) ? subCategory : [subCategory];
        const names = Array.isArray(name) ? name : [name];
        const users = Array.isArray(user) ? user.map(u => JSON.parse(u)) : [JSON.parse(user)];

        if (!files || files.length === 0) {
            throw new Error('No files uploaded!');
        }

        const newPdfs = await Promise.all(
            files.map(async (file, index) => {
                const userObj = users[index] || users[0]; // Fallback if arrays mismatch
                const dbUser = await User.findOne({ id: userObj.id });
                if (!dbUser) throw new Error(`User not found: ${userObj.id}`);

                // Upload via Service
                const fileIdFromStorage = await storageService.saveFile(file);

                const newPdf = new Pdf({
                    category: categories[index] || categories[0],
                    subcategory: subcategorys[index] || subcategorys[0],
                    name: names[index] || names[0],
                    filePath: fileIdFromStorage, // Store Drive ID
                    uploadedBy: dbUser._id,
                });
                return await newPdf.save();
            })
        );
        return newPdfs;
    }

    // 2. Get PDFs (Complex Filtering)
    static async getPdfs({ role, subRole }) {
        const query = {};
        if (role) query['uploadedBy.role'] = role;
        if (subRole) query['uploadedBy.subRole'] = subRole;

        const pdfsSet = new Map();

        // A. Filter by UploadedBy (User based)
        if (role !== 'Student') {
            const userQuery = {};
            if (role) userQuery.role = role;
            if (subRole) userQuery.subRole = subRole;

            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(u => u._id);

            if (userIds.length > 0) {
                query.uploadedBy = { $in: userIds };
                const initialPdfs = await Pdf.find(query).populate('uploadedBy', 'username role subRole id');
                initialPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
            }
        }

        // B. Filter by Category (Role based)
        const extraCategories = [];
        if (role === 'Officers') {
            extraCategories.push('University related', "Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Dean') {
            extraCategories.push("Dean's related", "Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'Asso.Dean') {
            extraCategories.push("Asso.Dean's related", "HOD's related", 'Faculty related', 'Dept.Equipment');
        } else if (role === 'HOD') {
            extraCategories.push("HOD's related", 'Faculty related', 'Dept.Equipment', 'Staff Presentations');
        } else if (role === 'Faculty') {
            extraCategories.push('Faculty related', 'Dept.Equipment', 'Staff Presentations');
        }

        if (extraCategories.length > 0) {
            const extraPdfs = await Pdf.find({ category: { $in: extraCategories } }).populate('uploadedBy', 'username role subRole id');
            extraPdfs.forEach(pdf => pdfsSet.set(pdf._id.toString(), pdf));
        }

        return Array.from(pdfsSet.values());
    }

    // 3. Edit PDF
    static async editPdf(id, file, body) {
        const { category, name } = body;
        const updatedFields = { category, name };

        if (file) {
            // Upload new file
            const fileIdFromStorage = await storageService.saveFile(file);
            updatedFields.filePath = fileIdFromStorage;

            // Note: We are currently NOT deleting the old file from Drive in the edit logic
            // (Preserving original server.js behavior for now)
        }

        const updatedPdf = await Pdf.findByIdAndUpdate(id, updatedFields, { new: true });
        return updatedPdf;
    }

    // 4. Delete PDF
    static async deletePdf(id) {
        const pdfToDelete = await Pdf.findById(id);
        if (pdfToDelete && pdfToDelete.filePath) {
            // Delete from Drive
            await storageService.deleteFile(pdfToDelete.filePath);
        }
        return await Pdf.findByIdAndDelete(id);
    }
}

module.exports = PdfService;
