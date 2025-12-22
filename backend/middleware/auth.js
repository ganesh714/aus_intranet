import jwt from "jsonwebtoken";
import User from "../models/userschema.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👇 Fetch full user from DB
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 👇 Attach user to request
    req.user = {
      userId: user._id,
      id: user.id,
      role: user.role,
      department:
        user.student?.department ||
        user.faculty?.department ||
        user.hod?.department ||
        null, // Dean, Leadership, SuperAdmin
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
