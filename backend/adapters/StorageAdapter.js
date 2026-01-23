// Interface (Abstract Class)
class StorageAdapter {
    async saveFile(file) { throw new Error("Method 'saveFile' must be implemented."); }
    async deleteFile(fileId) { throw new Error("Method 'deleteFile' must be implemented."); }
    async getFileStream(fileId) { throw new Error("Method 'getFileStream' must be implemented."); }
    async copyFile(fileId) { throw new Error("Method 'copyFile' must be implemented."); }
}
module.exports = StorageAdapter;
