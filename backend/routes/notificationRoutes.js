import express from "express";
import {
  getAdminNotifications,
  markNotificationRead,
  addNotification,
} from "../controllers/notificationController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Admin-only notification routes
router.get("/", requireAdmin, getAdminNotifications);
router.patch("/:id/read", requireAdmin, markNotificationRead);
router.post("/", requireAdmin, addNotification);

export default router;

