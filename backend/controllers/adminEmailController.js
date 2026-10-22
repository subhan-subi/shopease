import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SystemSetting from "../models/SystemSetting.js";
import {
  getSmtpStatus,
  sendAdminEmailChangeVerification,
  sendTestEmail as dispatchTestEmail,
  createTransporter,
} from "../utils/emailService.js";

// ==========================================
// GET ADMIN'S OWN PROFILE (email from MongoDB)
// GET /api/admin/email/me
// Source of truth: User.email in MongoDB — never .env
// ==========================================
export const getAdminMe = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id)
      .select("fullName email role authProvider pendingEmail")
      .lean();

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin user not found.", errorCode: "USER_NOT_FOUND" });
    }

    return res.status(200).json({
      success: true,
      admin: {
        fullName: admin.fullName,
        email: admin.email,           // The real login email — from MongoDB
        role: admin.role,
        authProvider: admin.authProvider,
        hasPendingEmailChange: !!admin.pendingEmail,
        pendingEmail: admin.pendingEmail || null,
      },
    });
  } catch (error) {
    console.error("GET ADMIN ME ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error.", errorCode: "SERVER_ERROR" });
  }
};

// ==========================================
// REQUEST ADMIN LOGIN EMAIL CHANGE
// POST /api/admin/email/request-change
// Body: { newEmail, currentPassword }
// Source of truth for current email: MongoDB User.email
// ==========================================
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    // 1. Validate new email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid new email address.", errorCode: "INVALID_EMAIL" });
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase();

    // 2. Load admin from MongoDB (with password) — this is the source of truth
    const admin = await User.findById(req.user._id).select("+password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin user not found.", errorCode: "USER_NOT_FOUND" });
    }

    // 3. Require password re-authentication (local accounts only)
    if (admin.authProvider === "local") {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to change your email.", errorCode: "PASSWORD_REQUIRED" });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect current password.", errorCode: "WRONG_PASSWORD" });
      }
    }

    // 4. Reject if new email is the same as current (comparing against MongoDB — not .env)
    if (normalizedNewEmail === admin.email) {
      return res.status(400).json({ success: false, message: "The new email is the same as your current login email.", errorCode: "SAME_EMAIL" });
    }

    // 5. Check no other MongoDB account already uses the new email
    const existingUser = await User.findOne({ email: normalizedNewEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "That email address is already registered to another account.", errorCode: "EMAIL_IN_USE" });
    }

    // 6. Confirm SMTP is configured before attempting to send
    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        success: false,
        errorCode: "EMAIL_SERVICE_NOT_CONFIGURED",
        message: "Email service is not configured. Set EMAIL_USER and EMAIL_PASSWORD in backend .env (SMTP credentials only — not your admin login email).",
      });
    }

    // 7. Generate secure token (raw token goes in email link, hashed version stored in DB)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    admin.emailVerificationToken = hashedToken;
    admin.emailVerificationExpires = expires;
    admin.pendingEmail = normalizedNewEmail;
    await admin.save({ validateModifiedOnly: true });

    // 8. Build verification URL — lands on public verify page (no login required)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyUrl = `${clientUrl}/admin/verify-email-change?token=${rawToken}`;

    // 9. Send verification email to the NEW address via SMTP
    const emailResult = await sendAdminEmailChangeVerification({
      to: normalizedNewEmail,
      verifyUrl,
      adminName: admin.fullName || "Admin",
    });

    if (!emailResult.success) {
      // Rollback pending change on send failure
      admin.emailVerificationToken = null;
      admin.emailVerificationExpires = null;
      admin.pendingEmail = null;
      await admin.save({ validateModifiedOnly: true });

      return res.status(500).json({
        success: false,
        errorCode: emailResult.errorCode || "EMAIL_SEND_FAILED",
        message: "Failed to send verification email. Check SMTP credentials in backend .env and try again.",
        errorDetail: emailResult.errorDetail,
      });
    }

    return res.status(200).json({
      success: true,
      message: `A verification link has been sent to ${normalizedNewEmail}. Click it within 30 minutes to confirm the change. Your current email (${admin.email}) remains active until then.`,
    });
  } catch (error) {
    console.error("REQUEST EMAIL CHANGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error while processing email change request.", errorCode: "SERVER_ERROR" });
  }
};

// ==========================================
// VERIFY ADMIN LOGIN EMAIL CHANGE
// GET /api/admin/email/verify-change/:token
// PUBLIC — no auth required (the token IS the proof of identity)
// Updates User.email in MongoDB upon successful verification
// ==========================================
export const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== "string" || token.length < 10) {
      return res.status(400).json({ success: false, message: "Invalid or missing verification token.", errorCode: "INVALID_TOKEN" });
    }

    // 1. Hash the incoming token to compare with the stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find the admin document with matching token, not expired, and a pendingEmail set
    const admin = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
      pendingEmail: { $nin: [null, ""] },
      role: "admin",    // Safety: only for admins
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired. Please request a new email change from the Admin Panel.",
        errorCode: "TOKEN_EXPIRED_OR_INVALID",
      });
    }

    // 3. Race-condition guard — ensure the pending email is not now taken by someone else
    const conflict = await User.findOne({ email: admin.pendingEmail, _id: { $ne: admin._id } });
    if (conflict) {
      // Clear the pending change since it can no longer be applied
      admin.emailVerificationToken = null;
      admin.emailVerificationExpires = null;
      admin.pendingEmail = null;
      await admin.save({ validateModifiedOnly: true });
      return res.status(409).json({ success: false, message: "That email is now in use by another account. Please request a new email change.", errorCode: "EMAIL_IN_USE" });
    }

    // 4. Apply the email change to MongoDB — this is the ONLY source of truth for admin login
    const newEmail = admin.pendingEmail;
    admin.email = newEmail;
    admin.pendingEmail = null;
    admin.emailVerificationToken = null;
    admin.emailVerificationExpires = null;
    await admin.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: `Your admin login email has been updated to ${newEmail}. Please log in again using your new email address.`,
      newEmail,
    });
  } catch (error) {
    console.error("VERIFY EMAIL CHANGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error during email verification.", errorCode: "SERVER_ERROR" });
  }
};

// ==========================================
// SEND TEST EMAIL (Admin — SMTP infrastructure check only)
// POST /api/admin/email/test
// ==========================================
export const sendTestEmail = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    // Default to admin's own MongoDB email (not EMAIL_USER from .env)
    const destination = targetEmail
      ? targetEmail.trim().toLowerCase()
      : req.user.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(destination)) {
      return res.status(400).json({ success: false, message: "Please enter a valid destination email address.", errorCode: "INVALID_EMAIL" });
    }

    const result = await dispatchTestEmail({ to: destination });
    if (!result.success) {
      return res.status(result.errorCode === "EMAIL_SERVICE_NOT_CONFIGURED" ? 503 : 400).json({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
        errorDetail: result.errorDetail,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test email dispatched to ${destination}. Check the inbox (or spam folder).`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("SEND TEST EMAIL ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error while sending test email.", errorCode: "SERVER_ERROR" });
  }
};

// ==========================================
// GET SMTP SENDER IDENTITY SETTINGS
// GET /api/admin/email/settings
// Note: This is SMTP sender identity only — not the admin login email
// ==========================================
export const getEmailSettings = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: "email" }).lean();
    const smtpStatus = await getSmtpStatus();

    return res.status(200).json({
      success: true,
      settings: {
        senderEmail: setting?.senderEmail || "",
        senderName: setting?.senderName || "ShopEase",
        replyToEmail: setting?.replyToEmail || "",
        updatedAt: setting?.updatedAt || null,
      },
      smtp: smtpStatus,
    });
  } catch (error) {
    console.error("GET EMAIL SETTINGS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching email settings.", errorCode: "SERVER_ERROR" });
  }
};
