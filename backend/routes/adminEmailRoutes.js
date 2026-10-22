import express from "express";
import rateLimit from "express-rate-limit";
import {
  getAdminMe,
  getEmailSettings,
  sendTestEmail,
  requestEmailChange,
  verifyEmailChange,
} from "../controllers/adminEmailController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTE: Email change verification
// The raw token in the link IS the authentication — no JWT required.
// ==========================================
const verifyChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many verification attempts.", errorCode: "RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
});
router.get("/verify-change/:token", verifyChangeLimiter, verifyEmailChange);

// ==========================================
// PROTECTED ROUTES — require admin JWT
// ==========================================
router.use(authMiddleware);
router.use(requireAdmin);

// GET: Admin's own login email from MongoDB (source of truth — not .env)
router.get("/me", getAdminMe);

// GET: SMTP sender identity settings (separate from admin login email)
router.get("/settings", getEmailSettings);

// Rate limiters
const testEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Test email limit reached. Please wait a few minutes.", errorCode: "RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailChangeLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many email change requests. Please wait 30 minutes.", errorCode: "RATE_LIMIT_EXCEEDED" },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST: Send SMTP test email
router.post("/test", testEmailLimiter, sendTestEmail);

// POST: Request admin LOGIN email change — sends verification to new email
router.post("/request-change", emailChangeLimiter, requestEmailChange);

export default router;
