const FdpSttpAttendedService = require('../services/FdpSttpAttendedService');

// Add FDP/STTP Attended
const addFdpSttp = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const fdpSttp = await FdpSttpAttendedService.addFdpSttp(userId, data);
        res.status(201).json({ message: 'FDP/STTP attended added successfully', fdpSttp });
    } catch (error) {
        console.error("Error adding FDP/STTP attended:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message || 'Error adding FDP/STTP attended' });
    }
};

// Get FDP/STTP Attended
const getFdpSttps = async (req, res) => {
    try {
        const fdpSttps = await FdpSttpAttendedService.getFdpSttps(req.query);
        res.json({ records: fdpSttps });
    } catch (error) {
        console.error("Error fetching FDP/STTP attended:", error);
        res.status(500).json({ message: 'Error fetching FDP/STTP attended' });
    }
};

// Delete FDP/STTP Attended
const deleteFdpSttp = async (req, res) => {
    try {
        await FdpSttpAttendedService.deleteFdpSttp(req.params.id);
        res.json({ message: 'FDP/STTP attended deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FDP/STTP attended' });
    }
};

// Update FDP/STTP Attended
const updateFdpSttp = async (req, res) => {
    try {
        const updated = await FdpSttpAttendedService.updateFdpSttp(req.params.id, req.body);
        res.json({ message: 'FDP/STTP attended updated', fdpSttp: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating FDP/STTP attended' });
    }
};

module.exports = {
    addFdpSttp,
    getFdpSttps,
    deleteFdpSttp,
    updateFdpSttp
};
