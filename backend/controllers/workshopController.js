const WorkshopService = require('../services/WorkshopService');

// Add Workshop
const addWorkshop = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const workshop = await WorkshopService.addWorkshop(userId, data);
        res.status(201).json({ message: 'Workshop added successfully', workshop });
    } catch (error) {
        console.error("Error adding workshop:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message || 'Error adding workshop' });
    }
};

// Get Workshops
const getWorkshops = async (req, res) => {
    try {
        const workshops = await WorkshopService.getWorkshops(req.query);
        res.json({ workshops });
    } catch (error) {
        console.error("Error fetching workshops:", error);
        res.status(500).json({ message: 'Error fetching workshops' });
    }
};

// Delete Workshop
const deleteWorkshop = async (req, res) => {
    try {
        await WorkshopService.deleteWorkshop(req.params.id);
        res.json({ message: 'Workshop deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workshop' });
    }
};

// Update Workshop
const updateWorkshop = async (req, res) => {
    try {
        const updated = await WorkshopService.updateWorkshop(req.params.id, req.body);
        res.json({ message: 'Workshop updated', workshop: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating workshop' });
    }
};

module.exports = {
    addWorkshop,
    getWorkshops,
    deleteWorkshop,
    updateWorkshop
};
