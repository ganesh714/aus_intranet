const SchoolProgram = require('../models/SchoolProgram');

class SchoolProgramService {
    static async addSchoolProgram(data) {
        const { school, level, program, duration, departments } = data;
        const newProgram = new SchoolProgram({
            school,
            level,
            program,
            duration,
            departments: departments || []
        });
        await newProgram.save();
        return newProgram;
    }

    static async getSchoolPrograms() {
        return await SchoolProgram.find().populate('departments.subRoleRef');
    }

    static async getSchoolProgramById(id) {
        const program = await SchoolProgram.findById(id).populate('departments.subRoleRef');
        if (!program) {
            const error = new Error('School Program not found');
            error.statusCode = 404;
            throw error;
        }
        return program;
    }

    static async updateSchoolProgram(id, data) {
        const updatedProgram = await SchoolProgram.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).populate('departments.subRoleRef');

        if (!updatedProgram) {
            const error = new Error('School Program not found');
            error.statusCode = 404;
            throw error;
        }
        return updatedProgram;
    }

    static async deleteSchoolProgram(id) {
        const deletedProgram = await SchoolProgram.findByIdAndDelete(id);
        if (!deletedProgram) {
            const error = new Error('School Program not found');
            error.statusCode = 404;
            throw error;
        }
        return true;
    }
}

module.exports = SchoolProgramService;
