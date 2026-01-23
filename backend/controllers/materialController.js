const MaterialService = require('../services/MaterialService');

// 1. Add Material
const addMaterial = async (req, res) => {
    try {
        const material = await MaterialService.addMaterial(req.file, req.body);
        res.json({ message: 'Material uploaded successfully!', material });
    } catch (error) {
        console.error("Error uploading material:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: "Error uploading material", error: error.message });
    }
};

// 2. Get Materials
const getMaterials = async (req, res) => {
    try {
        const materials = await MaterialService.getMaterials(req.query);
        res.json({ materials });
    } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).json({ message: "Error fetching materials", error });
    }
};

// 3. Copy Shared
const copySharedToDrive = async (req, res) => {
    try {
        const { materialId, targetFolderId, userId } = req.body;
        await MaterialService.copySharedToDrive(materialId, targetFolderId, userId);
        res.json({ message: 'Copied to My Data' });
    } catch (error) {
        console.error("Error coping shared file:", error);
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json({ message: "Error copying file", error: error.message });
    }
};

// 4. Hide Shared
const hideSharedMaterial = async (req, res) => {
    try {
        const { materialId, userId } = req.body;
        await MaterialService.hideSharedMaterial(materialId, userId);
        res.json({ message: 'Material hidden' });
    } catch (error) {
        res.status(500).json({ message: "Error hiding material", error });
    }
};

module.exports = {
    addMaterial,
    getMaterials,
    copySharedToDrive,
    hideSharedMaterial
};
