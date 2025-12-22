import Circular from "../models/circulars.js";
export const createCircular = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, message, roles, department } = req.body;

    let attachment = null;
     console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    if (req.file) {
      attachment = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/circulars/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }

    const circular = await Circular.create({
      title,
      content: message,
      targetRoles: roles,
      departments: department === "All" ? ["All"] : [department],
      attachment,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Circular sent successfully",
      circular
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send circular" });
  }
};

export const getCircularsForUser = async (req, res) => {
  try {
    const { role, department } = req.user;

    // Build filter
    console.log("User role:", role);
    console.log("User department:", req.user);
    const filter = {
      isActive: true,
      targetRoles: role,
      $or: [
        { departments: "All" },
        { departments: department }
      ],
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    };

    const circulars = await Circular.find(filter)
      .populate("createdBy", "role")
      .sort({ createdAt: -1 });

    res.json({
      count: circulars.length,
      circulars
    });

  } catch (error) {
    console.error("Get circulars error:", error);
    res.status(500).json({ message: "Failed to fetch circulars" });
  }
};