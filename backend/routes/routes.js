import express from "express";
/*import authRoutes from "./authRoutes.js";
import pdfRoutes from "./pdfRoutes.js";
import announcementRoutes from "./announcementRoutes.js";*/
import { loginController } from "../controllers/login.js";
const router = express.Router();

// router.use("/auth", authRoutes);
// router.use("/pdf", pdfRoutes);
// router.use("/announcement", announcementRoutes);
router.use("/login", loginController);

export default router;
