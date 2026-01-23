const DriveItem = require('../models/DriveItem');
const User = require('../models/User');
const File = require('../models/File');
const storageService = require('./storageService');

class DriveService {

    // 1. Get Drive Items (with Migration)
    static async getDriveItems(userId, folderId) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        let parentId = folderId;
        if (folderId === 'null' || folderId === 'undefined' || !folderId) {
            parentId = null;
        }

        // --- MIGRATION LOGIC START ---
        if (parentId === null) {
            const existingDriveItems = await DriveItem.find({ owner: user._id, type: 'file' }).select('fileId');
            const linkedFileIds = existingDriveItems.map(item => item.fileId);

            const legacyFiles = await File.find({
                "uploadedBy": user._id,
                "usage.isPersonal": true,
                "_id": { $nin: linkedFileIds }
            });

            for (const file of legacyFiles) {
                await DriveItem.create({
                    name: file.fileName,
                    type: 'file',
                    parent: null,
                    owner: user._id,
                    fileId: file._id
                });
                console.log(`Migrated legacy file to Drive: ${file.fileName}`);
            }
        }
        // --- MIGRATION LOGIC END ---

        let items = await DriveItem.find({
            owner: user._id,
            parent: parentId
        }).populate('fileId').lean();

        // Calculate itemCount for folders
        items = await Promise.all(items.map(async (item) => {
            if (item.type === 'folder') {
                const count = await DriveItem.countDocuments({ parent: item._id });
                return { ...item, itemCount: count };
            }
            return item;
        }));

        // Fetch current folder
        let currentFolder = null;
        if (parentId) {
            currentFolder = await DriveItem.findById(parentId);
        }

        // Calculate Storage Used
        const storageStats = await File.aggregate([
            { $match: { uploadedBy: user._id, "usage.isPersonal": true } },
            { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
        ]);
        const storageUsed = storageStats.length > 0 ? storageStats[0].totalSize : 0;

        // Calculate Breadcrumbs
        const breadcrumbs = [];
        if (currentFolder) {
            let curr = currentFolder;
            while (curr) {
                breadcrumbs.unshift({ _id: curr._id, name: curr.name });
                if (curr.parent) {
                    curr = await DriveItem.findById(curr.parent);
                } else {
                    curr = null;
                }
            }
        }
        breadcrumbs.unshift({ _id: null, name: 'My Data' });

        return { items, folder: currentFolder, path: breadcrumbs, storageUsed };
    }

    // 2. Create Folder
    static async createFolder(name, parentId, userId) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const existingItem = await DriveItem.findOne({
            owner: user._id,
            parent: parentId || null,
            name: name
        });
        if (existingItem) throw new Error('A folder or file with this name already exists in this destination.');

        const newFolder = new DriveItem({
            name,
            type: 'folder',
            parent: parentId || null,
            owner: user._id
        });

        return await newFolder.save();
    }

    // 3. Upload Files to Drive
    static async uploadFiles(files, body) {
        const userJson = JSON.parse(body.user);
        const parentId = body.parentId === 'null' ? null : body.parentId;

        const userDb = await User.findOne({ id: userJson.id });
        if (!userDb) throw new Error('User not found');

        if (!files || files.length === 0) throw new Error('No files uploaded!');

        // Check duplicates
        for (const file of files) {
            const existing = await DriveItem.findOne({
                owner: userDb._id,
                parent: parentId,
                name: file.originalname
            });
            if (existing) {
                throw new Error(`File with name "${file.originalname}" already exists.`);
            }
        }

        const savedItems = await Promise.all(files.map(async (file) => {
            const fileIdFromStorage = await storageService.saveFile(file);

            const newFile = new File({
                fileName: file.originalname,
                filePath: fileIdFromStorage,
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userDb._id,
                usage: { isPersonal: true }
            });
            const savedFile = await newFile.save();

            const newDriveItem = new DriveItem({
                name: file.originalname,
                type: 'file',
                parent: parentId,
                owner: userDb._id,
                fileId: savedFile._id
            });
            return await newDriveItem.save();
        }));

        return savedItems;
    }

    // 4. Rename Item
    static async renameItem(id, newName) {
        const currentItem = await DriveItem.findById(id);
        if (!currentItem) throw new Error("Item not found");

        const existing = await DriveItem.findOne({
            owner: currentItem.owner,
            parent: currentItem.parent,
            name: newName
        });
        if (existing && existing._id.toString() !== id) {
            throw new Error("An item with this name already exists.");
        }

        return await DriveItem.findByIdAndUpdate(id, { name: newName }, { new: true });
    }

    // 5. Move Item
    static async moveItem(id, newParentId) {
        const item = await DriveItem.findById(id);
        if (!item) throw new Error("Item not found");

        if (newParentId === id) throw new Error("Cannot move a folder into itself.");

        // Check Circular
        if (item.type === 'folder' && newParentId) {
            let current = await DriveItem.findById(newParentId);
            while (current) {
                if (current._id.toString() === id) {
                    throw new Error("Cannot move a folder into one of its subfolders.");
                }
                if (!current.parent) break;
                current = await DriveItem.findById(current.parent);
            }
        }

        // Check Duplicate
        const existing = await DriveItem.findOne({
            owner: item.owner,
            parent: newParentId || null,
            name: item.name
        });
        if (existing) throw new Error(`An item with name "${item.name}" already exists in the destination.`);

        return await DriveItem.findByIdAndUpdate(id, { parent: newParentId || null }, { new: true });
    }

    // 6. Recursive Delete
    static async deleteItem(id) {
        const item = await DriveItem.findById(id);
        if (!item) throw new Error("Item not found");

        async function deleteItemRecursively(itemId) {
            const currentItem = await DriveItem.findById(itemId);
            if (!currentItem) return;

            if (currentItem.type === 'folder') {
                const children = await DriveItem.find({ parent: itemId });
                for (const child of children) {
                    await deleteItemRecursively(child._id);
                }
            } else {
                if (currentItem.fileId) {
                    const fileRecord = await File.findById(currentItem.fileId);
                    if (fileRecord) {
                        if (fileRecord.filePath) {
                            await storageService.deleteFile(fileRecord.filePath);
                        }
                        await File.findByIdAndDelete(currentItem.fileId);
                    }
                }
            }
            await DriveItem.findByIdAndDelete(itemId);
        }

        await deleteItemRecursively(id);
    }

    // 7. Get Folders (Picker)
    static async getFolders(userId) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        return await DriveItem.find({
            owner: user._id,
            type: 'folder'
        }).select('name parent _id');
    }

    // 8. Copy Item
    static async copyItem(itemId, targetParentId, userId) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const itemToCopy = await DriveItem.findById(itemId);
        if (!itemToCopy) throw new Error("Item not found");

        if (targetParentId === itemId) throw new Error("Cannot copy a folder into itself.");

        // Circular check
        if (itemToCopy.type === 'folder' && targetParentId) {
            let current = await DriveItem.findById(targetParentId);
            while (current) {
                if (current._id.toString() === itemId) {
                    throw new Error("Cannot copy a folder into one of its subfolders.");
                }
                if (!current.parent) break;
                current = await DriveItem.findById(current.parent);
            }
        }

        // Duplicate check
        const existing = await DriveItem.findOne({
            owner: user._id,
            parent: targetParentId || null,
            name: itemToCopy.name
        });
        if (existing) throw new Error(`Item "${itemToCopy.name}" already exists in destination.`);

        // Recursive Copy Function
        async function copyRecursively(sourceItem, newParentId) {
            if (sourceItem.type === 'folder') {
                // Create new folder
                const newFolder = await DriveItem.create({
                    name: sourceItem.name,
                    type: 'folder',
                    parent: newParentId,
                    owner: user._id
                });

                // Copy children
                const children = await DriveItem.find({ parent: sourceItem._id });
                for (const child of children) {
                    await copyRecursively(child, newFolder._id);
                }
            } else {
                // File Copy
                if (sourceItem.fileId) {
                    const originalFile = await File.findById(sourceItem.fileId);
                    if (originalFile) {
                        // 1. Physical Copy
                        const newStorageId = await storageService.copyFile(originalFile.filePath);

                        // 2. New File Record
                        const newFileRecord = new File({
                            fileName: originalFile.fileName,
                            filePath: newStorageId, // UNIQUE
                            fileType: originalFile.fileType,
                            fileSize: originalFile.fileSize,
                            uploadedBy: user._id,
                            usage: { isPersonal: true }
                        });
                        const savedFile = await newFileRecord.save();

                        // 3. New DriveItem
                        await DriveItem.create({
                            name: sourceItem.name,
                            type: 'file',
                            parent: newParentId,
                            owner: user._id,
                            fileId: savedFile._id
                        });
                    }
                }
            }
        }

        await copyRecursively(itemToCopy, targetParentId || null);
    }

    // 9. Search
    static async searchDrive(userId, query) {
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        if (!query || query.trim() === '') return [];

        return await DriveItem.find({
            owner: user._id,
            name: { $regex: query, $options: 'i' }
        })
            .populate('fileId')
            .populate('parent', 'name')
            .limit(50);
    }

    // 10. Legacy Get Personal
    static async getPersonalFiles(id) {
        const user = await User.findOne({ id });
        if (!user) return [];
        return await File.find({
            "uploadedBy": user._id,
            "usage.isPersonal": true
        }).populate('uploadedBy', 'id username').sort({ uploadedAt: -1 });
    }

    // 11. Legacy Upload Personal
    static async uploadPersonalFile(files, body) {
        const user = JSON.parse(body.user);
        const userDb = await User.findOne({ id: user.id });
        if (!userDb) throw new Error('User not found');
        const names = Array.isArray(body.name) ? body.name : [body.name];

        if (!files || files.length === 0) throw new Error('No files uploaded!');

        const savedFiles = await Promise.all(files.map(async (file, index) => {
            const fileIdFromStorage = await storageService.saveFile(file);
            const newFile = new File({
                fileName: names[index] || file.originalname,
                filePath: fileIdFromStorage,
                fileType: file.mimetype,
                fileSize: file.size,
                uploadedBy: userDb._id,
                usage: { isPersonal: true }
            });
            return await newFile.save();
        }));
        return savedFiles;
    }

    // 12. Get File Stream
    static async getFileStream(id) {
        return await storageService.getFileStream(id);
    }
}

module.exports = DriveService;
