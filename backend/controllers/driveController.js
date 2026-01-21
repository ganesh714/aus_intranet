const DriveService = require('../services/DriveService');

// 1. Get Items
const getDriveItems = async (req, res) => {
    try {
        const result = await DriveService.getDriveItems(req.query.userId, req.query.folderId);
        res.json(result);
    } catch (error) {
        console.error("Error fetching drive items:", error);
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json({ message: "Error fetching items", error: error.message });
    }
};

// 2. Create Folder
const createFolder = async (req, res) => {
    try {
        const { name, parentId, userId } = req.body;
        const folder = await DriveService.createFolder(name, parentId, userId);
        res.json({ message: "Folder created", folder });
    } catch (error) {
        const status = error.message.includes('exists') ? 400 : 500;
        res.status(status).json({ message: error.message, error });
    }
};

// 3. Upload
const uploadFiles = async (req, res) => {
    try {
        const items = await DriveService.uploadFiles(req.files, req.body);
        res.json({ message: "Files uploaded to Drive", items });
    } catch (error) {
        const status = error.message.includes('exists') ? 400 : 500;
        res.status(status).json({ message: error.message, error });
    }
};

// 4. Rename
const renameItem = async (req, res) => {
    try {
        const item = await DriveService.renameItem(req.params.id, req.body.newName);
        res.json({ message: "Renamed successfully", item });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
};

// 5. Move
const moveItem = async (req, res) => {
    try {
        const item = await DriveService.moveItem(req.params.id, req.body.newParentId);
        res.json({ message: "Moved successfully", item });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
};

// 6. Delete
const deleteItem = async (req, res) => {
    try {
        await DriveService.deleteItem(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting:", error);
        res.status(500).json({ message: "Error deleting", error: error.message });
    }
};

// 7. Get Folders
const getFolders = async (req, res) => {
    try {
        const folders = await DriveService.getFolders(req.query.userId);
        res.json({ folders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching folders", error });
    }
};

// 8. Copy
const copyItem = async (req, res) => {
    try {
        const { itemId, targetParentId, userId } = req.body;
        await DriveService.copyItem(itemId, targetParentId, userId);
        res.json({ message: "Copied successfully" });
    } catch (error) {
        console.error("Error copying:", error);
        res.status(500).json({ message: error.message, error });
    }
};

// 9. Search
const searchDrive = async (req, res) => {
    try {
        const items = await DriveService.searchDrive(req.query.userId, req.query.query);
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: "Error searching drive", error });
    }
};

// 10. Legacy Personal Files
const getPersonalFiles = async (req, res) => {
    try {
        const files = await DriveService.getPersonalFiles(req.query.id);
        res.json({ files });
    } catch (error) {
        res.status(500).json({ message: "Error fetching personal files", error });
    }
};

const uploadPersonalFile = async (req, res) => {
    try {
        const files = await DriveService.uploadPersonalFile(req.files, req.body);
        res.json({ message: "Files saved to My Data successfully!", files });
    } catch (error) {
        res.status(500).json({ message: "Error uploading files", error });
    }
};

// Proxy File
const proxyFile = async (req, res) => {
    try {
        const stream = await DriveService.getFileStream(req.params.id);
        stream.pipe(res);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(404).json({ message: "File not found" });
    }
};

module.exports = {
    getDriveItems,
    createFolder,
    uploadFiles,
    renameItem,
    moveItem,
    deleteItem,
    getFolders,
    copyItem,
    searchDrive,
    getPersonalFiles,
    uploadPersonalFile,
    proxyFile
};
