const GoogleDriveAdapter = require('../adapters/GoogleDriveAdapter');
class StorageService {
    constructor() {
        this.adapter = new GoogleDriveAdapter(); // Switch this line to change providers!
    }
    async saveFile(file) { return this.adapter.saveFile(file); }
    async deleteFile(fileId) { return this.adapter.deleteFile(fileId); }
    async getFileStream(fileId) { return this.adapter.getFileStream(fileId); }
    async copyFile(fileId) { return this.adapter.copyFile(fileId); }
}
// Singleton Pattern: Export a single instance
module.exports = new StorageService();
