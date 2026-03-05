const IndustrialVisitService = require('../services/IndustrialVisitService');

// Add Industrial Visit
const addVisit = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const visit = await IndustrialVisitService.addVisit(userId, data);
        res.status(201).json({ message: 'Industrial visit added successfully', visit });
    } catch (error) {
        console.error("Error adding industrial visit:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message || 'Error adding industrial visit' });
    }
};

// Get Industrial Visits
const getVisits = async (req, res) => {
    try {
        const visits = await IndustrialVisitService.getVisits(req.query);
        res.json({ visits });
    } catch (error) {
        console.error("Error fetching industrial visits:", error);
        res.status(500).json({ message: 'Error fetching industrial visits' });
    }
};

// Delete Industrial Visit
const deleteVisit = async (req, res) => {
    try {
        await IndustrialVisitService.deleteVisit(req.params.id);
        res.json({ message: 'Industrial visit deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting industrial visit' });
    }
};

// Update Industrial Visit
const updateVisit = async (req, res) => {
    try {
        const updated = await IndustrialVisitService.updateVisit(req.params.id, req.body);
        res.json({ message: 'Industrial visit updated', visit: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating industrial visit' });
    }
};

module.exports = {
    addVisit,
    getVisits,
    deleteVisit,
    updateVisit
};
