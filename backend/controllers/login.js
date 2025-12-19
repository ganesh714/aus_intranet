import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userschema.js";

export const loginController = async (req, res) => {
  try {
    const { id, password, role } = req.body;

    if (!id || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      id: id.trim(),
      role,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // ✅ SEND TOKEN TO FRONTEND
    return res.json({
      message: "Login successful",
      token,
      user: {
        loginId: user.id,
        role: user.role,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
