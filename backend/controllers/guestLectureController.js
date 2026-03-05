const GuestLectureService = require('../services/GuestLectureService');

// Add Guest Lecture
const addLecture = async (req, res) => {
    try {
        const { userId, ...data } = req.body;
        const lecture = await GuestLectureService.addLecture(userId, data);
        res.status(201).json({ message: 'Guest lecture added successfully', lecture });
    } catch (error) {
        console.error("Error adding guest lecture:", error);
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message || 'Error adding guest lecture' });
    }
};

// Get Guest Lectures
const getLectures = async (req, res) => {
    try {
        const lectures = await GuestLectureService.getLectures(req.query);
        res.json({ lectures });
    } catch (error) {
        console.error("Error fetching guest lectures:", error);
        res.status(500).json({ message: 'Error fetching guest lectures' });
    }
};

// Delete Guest Lecture
const deleteLecture = async (req, res) => {
    try {
        await GuestLectureService.deleteLecture(req.params.id);
        res.json({ message: 'Guest lecture deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting guest lecture' });
    }
};

// Update Guest Lecture
const updateLecture = async (req, res) => {
    try {
        const updated = await GuestLectureService.updateLecture(req.params.id, req.body);
        res.json({ message: 'Guest lecture updated', lecture: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error updating guest lecture' });
    }
};

module.exports = {
    addLecture,
    getLectures,
    deleteLecture,
    updateLecture
};
