const SchoolProgramService = require('../services/SchoolProgramService');

const addSchoolProgram = async (req, res) => {
    try {
        const newProgram = await SchoolProgramService.addSchoolProgram(req.body);
        res.status(201).json({ message: 'School Program created successfully', data: newProgram });
    } catch (error) {
        console.error("Error creating School Program:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error creating School Program', error: error.message });
    }
};

const getSchoolPrograms = async (req, res) => {
    try {
        const programs = await SchoolProgramService.getSchoolPrograms();
        res.status(200).json({ data: programs });
    } catch (error) {
        console.error("Error fetching School Programs:", error);
        res.status(500).json({ message: 'Error fetching School Programs', error: error.message });
    }
};

const getSchoolProgramById = async (req, res) => {
    try {
        const program = await SchoolProgramService.getSchoolProgramById(req.params.id);
        res.status(200).json({ data: program });
    } catch (error) {
        console.error("Error fetching School Program:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error fetching School Program', error: error.message });
    }
};

const updateSchoolProgram = async (req, res) => {
    try {
        const updatedProgram = await SchoolProgramService.updateSchoolProgram(req.params.id, req.body);
        res.status(200).json({ message: 'School Program updated successfully', data: updatedProgram });
    } catch (error) {
        console.error("Error updating School Program:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error updating School Program', error: error.message });
    }
};

const deleteSchoolProgram = async (req, res) => {
    try {
        await SchoolProgramService.deleteSchoolProgram(req.params.id);
        res.status(200).json({ message: 'School Program deleted successfully' });
    } catch (error) {
        console.error("Error deleting School Program:", error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: 'Error deleting School Program', error: error.message });
    }
};

module.exports = {
    addSchoolProgram,
    getSchoolPrograms,
    getSchoolProgramById,
    updateSchoolProgram,
    deleteSchoolProgram
};
