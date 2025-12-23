import express from "express";
/*import authRoutes from "./authRoutes.js";
import pdfRoutes from "./pdfRoutes.js";
import announcementRoutes from "./announcementRoutes.js";*/
import { loginController } from "../controllers/login.js";
import { protect } from "../middleware/auth.js";
import { getQuickStats } from "../controllers/getstats.js";
import { createCircular } from "../controllers/circularsControllers.js";
import { getCircularsForUser } from "../controllers/circularsControllers.js";
import { uploadCircular } from "../middleware/uploadCircular.js";
import { createAnnouncement } from "../controllers/annocumentscircular.js";
import { getAnnouncements } from "../controllers/annocumentscircular.js";
import path from "path";
const router = express.Router();

// router.use("/auth", authRoutes);
// router.use("/pdf", pdfRoutes);
// router.use("/announcement", announcementRoutes);
router.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
router.post("/login", loginController);
router.get("/superadmin/quick-statas", protect, getQuickStats);
router.get("/circulars/view", protect, getCircularsForUser);
router.post("/superadmin/circulars/send", protect,uploadCircular.single("file"), createCircular);
router.post("/announcements/send",protect,createAnnouncement);
router.get("/announcements/view",protect,getAnnouncements);
export default router;
