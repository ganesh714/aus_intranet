const FdpPdpOrganizedService = require('../services/FdpPdpOrganizedService');

// Add FDP/PDP Organized
const addFdpPdp = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const fdpPdp = await FdpPdpOrganizedService.addFdpPdp(userId, data);
        res.status(201).json({ message: 'FDP/PDP organized added successfully', fdpPdp });
    } catch (error) {
        console.error("Error adding FDP/PDP organized:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message || 'Error adding FDP/PDP organized' });
    }
};

// Get FDP/PDP Organized
const getFdpPdps = async (req, res) => {
    try {
        const fdpPdps = await FdpPdpOrganizedService.getFdpPdps(req.query);
        res.json({ fdpPdps });
    } catch (error) {
        console.error("Error fetching FDP/PDP organized:", error);
        res.status(500).json({ message: 'Error fetching FDP/PDP organized' });
    }
};

// Delete FDP/PDP Organized
const deleteFdpPdp = async (req, res) => {
    try {
        await FdpPdpOrganizedService.deleteFdpPdp(req.params.id);
        res.json({ message: 'FDP/PDP organized deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FDP/PDP organized' });
    }
};

// Update FDP/PDP Organized
const updateFdpPdp = async (req, res) => {
    try {
        const updated = await FdpPdpOrganizedService.updateFdpPdp(req.params.id, req.body);
        res.json({ message: 'FDP/PDP organized updated', fdpPdp: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating FDP/PDP organized' });
    }
};

module.exports = {
    addFdpPdp,
    getFdpPdps,
    deleteFdpPdp,
    updateFdpPdp
};
