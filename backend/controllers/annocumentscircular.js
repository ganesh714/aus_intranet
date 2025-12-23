import Announcement from "../models/Announcement.js";
export const createAnnouncement = async (req, res) => {
  try {
    if (!["SuperAdmin", "Dean", "HOD","faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      title,
      message,
      roles,
      departments,
      priority,
      startDate,
      endDate,
      links
    } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      targetRoles: roles,
      departments: departments || ["All"],
      priority,
      startDate,
      endDate,
      links: links || [],
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const { role } = req.user;

    // If department doesn't exist → treat as All
    const department = req.user.department || "All";

    const today = new Date();

    const announcements = await Announcement.find({
      isActive: true,

      // role based visibility
      targetRoles: role,

      // department based visibility
      $or: [
        { departments: "All" },
        { departments: department }
      ],

      // date validity
      $and: [
        { startDate: { $lte: today } },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: today } }
          ]
        }
      ]
    })
      .sort({
        priority: -1,     // urgent first
        createdAt: -1
      })
      .select("-__v")
      .populate("createdBy", "role");

    res.status(200).json({
      count: announcements.length,
      announcements
    });

  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      message: "Failed to fetch announcements"
    });
  }
};
