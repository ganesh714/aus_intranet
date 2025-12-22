import User from "../models/userschema.js";

export const getQuickStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalHODs,
      totalDeans,
      totalLeadership,
    ] = await Promise.all([
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "Faculty" }),
      User.countDocuments({ role: "HOD" }),
      User.countDocuments({ role: "Dean" }),
      User.countDocuments({ role: "Leadership" }),
    ]);
    res.status(200).json({
      totalStudents,
      totalFaculty,
      totalHODs,
      totalDeans,
      totalLeadership,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quick stats" });
  }
};
