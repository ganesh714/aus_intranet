const GoogleDriveAdapter = require('../adapters/GoogleDriveAdapter');
const LocalStorageAdapter = require('../adapters/LocalStorageAdapter');
require('dotenv').config();
class StorageService {
    constructor() {
        // Check .env for STORAGE_TYPE
        const storageType = process.env.STORAGE_TYPE || 'LOCAL';

        if (storageType === 'DRIVE') {
            console.log("📂 Storage Provider: Google Drive");
            this.adapter = new GoogleDriveAdapter();
        } else {
            console.log("💻 Storage Provider: Local Disk (uploads/)");
            this.adapter = new LocalStorageAdapter();
        }
    }

    async saveFile(file) { return this.adapter.saveFile(file); }
    async deleteFile(fileId) { return this.adapter.deleteFile(fileId); }
    async getFileStream(fileId) { return this.adapter.getFileStream(fileId); }
    async copyFile(fileId) { return this.adapter.copyFile(fileId); }
}
// Singleton Pattern: Export a single instance
module.exports = new StorageService();
