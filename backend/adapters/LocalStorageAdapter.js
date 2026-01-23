const fs = require('fs');
const path = require('path');
const StorageAdapter = require('./StorageAdapter');

class LocalStorageAdapter extends StorageAdapter {
    constructor() {
        super();
        // Define where files go. ensures 'uploads' folder exists.
        this.uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async saveFile(fileObject) {
        // 1. Create a unique filename (timestamp + original name) to avoid overwrites
        // Sanitizing filename further to be safe
        const safeName = fileObject.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${safeName}`;
        const filePath = path.join(this.uploadDir, filename);

        // 2. Write the buffer (from Multer) to the disk
        await fs.promises.writeFile(filePath, fileObject.buffer);

        // 3. Return the filename. This counts as the "ID" that gets saved to MongoDB.
        return filename;
    }

    async deleteFile(fileId) {
        // fileId is just the filename here
        if (!fileId) return false;

        const filePath = path.join(this.uploadDir, fileId);
        try {
            await fs.promises.unlink(filePath);
            return true;
        } catch (error) {
            console.error("Local Delete Error:", error);
            return false;
        }
    }

    async getFileStream(fileId) {
        const filePath = path.join(this.uploadDir, fileId);
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath);
        }
        throw new Error(`File not found: ${fileId}`);
    }

    async copyFile(fileId) {
        const oldPath = path.join(this.uploadDir, fileId);
        if (!fs.existsSync(oldPath)) {
            throw new Error(`File not found: ${fileId}`);
        }

        const newFilename = `COPY-${Date.now()}-${fileId}`;
        const newPath = path.join(this.uploadDir, newFilename);

        await fs.promises.copyFile(oldPath, newPath);
        return newFilename;
    }
}

module.exports = LocalStorageAdapter;
