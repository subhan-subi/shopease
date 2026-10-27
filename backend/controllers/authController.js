import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import https from "https";
import User from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/emailService.js";

// Helper: Resolve backend base URL for verification links
const getBackendBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }
  if (req && req.get) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host");
    if (host) {
      return `${proto}://${host}`;
    }
  }
  return (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
};

// Helper: Render HTML verification confirmation/failure page for browser visits
const renderVerificationPage = ({ success, title, message, loginUrl }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ShopEase</title>
  ${success ? `<meta http-equiv="refresh" content="5;url=${loginUrl}">` : ""}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: ${success ? "#10b981" : "#ef4444"};
      margin-bottom: 12px;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #ff6b00, #e05e00);
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 32px;
      border-radius: 8px;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .auto-redirect {
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "⚠️"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${loginUrl}" class="btn">Proceed to Sign In</a>
    ${success ? '<div class="auto-redirect">Redirecting automatically in 5 seconds...</div>' : ""}
  </div>
</body>
</html>`;

// ==========================================
// HELPER: Verify Firebase ID Token
// ==========================================
const verifyFirebaseIdToken = (idToken) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ idToken });
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      return reject(new Error("FIREBASE_API_KEY not configured on server."));
    }

    const options = {
      hostname: "identitytoolkit.googleapis.com",
      path: `/v1/accounts:lookup?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || "Invalid Firebase token"));
          }
          const user = parsed.users && parsed.users[0];
          if (!user) return reject(new Error("User not found in Firebase token response."));
          resolve(user);
        } catch (e) {
          reject(new Error("Failed to parse Firebase token response."));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
};

// ==========================================
// HELPER: Determine User Role
// ==========================================
const getAssignedRole = (email) => {
  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase().trim()) ? "admin" : "customer";
};

// ==========================================
// REGISTER
// ==========================================
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Token expires after 24 hours
    const verificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // Role is strictly determined server-side (default "customer", "admin" if in ADMIN_EMAIL)
    const assignedRole = getAssignedRole(normalizedEmail);

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Construct verification URL
    const backendBaseUrl = getBackendBaseUrl(req);
    const verificationUrl =
      `${backendBaseUrl}/api/auth/verify-email/${verificationToken}`;

    console.log("========================================");
    console.log("EMAIL VERIFICATION URL:");
    console.log(verificationUrl);
    console.log("========================================");

    // Dispatch branded verification email via SMTP
    try {
      const emailResult = await sendVerificationEmail({
        to: user.email,
        verifyUrl: verificationUrl,
        userName: user.fullName || "Valued Customer",
      });

      if (!emailResult.success) {
        console.error(
          "[AUTH] Verification email dispatch failed:",
          emailResult.errorCode,
          emailResult.errorDetail || emailResult.message
        );
      }
    } catch (emailErr) {
      console.error("[AUTH] Unexpected error dispatching verification email:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please verify your email.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating account.",
    });
  }
};

// ==========================================
// VERIFY EMAIL
// ==========================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const isHtmlRequest = Boolean(req.headers.accept?.includes("text/html"));
    const frontendBaseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173";
    const loginUrl = `${frontendBaseUrl.replace(/\/$/, "")}/Login`;

    if (!token) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderVerificationPage({
            success: false,
            title: "Verification Token Missing",
            message: "The verification link is missing a token. Please click the full link in your email.",
            loginUrl,
          })
        );
      }
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderVerificationPage({
            success: false,
            title: "Verification Link Invalid or Expired",
            message: "This email verification link is invalid or has expired. If you have already verified, please sign in.",
            loginUrl,
          })
        );
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    if (isHtmlRequest) {
      return res.status(200).send(
        renderVerificationPage({
          success: true,
          title: "Email Verified Successfully!",
          message: "Your email address has been verified. You can now sign in to your ShopEase account.",
          loginUrl,
        })
      );
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    const isHtmlRequest = Boolean(req.headers.accept?.includes("text/html"));
    if (isHtmlRequest) {
      const frontendBaseUrl =
        process.env.CLIENT_URL ||
        process.env.FRONTEND_URL ||
        "http://localhost:5173";
      const loginUrl = `${frontendBaseUrl.replace(/\/$/, "")}/Login`;
      return res.status(500).send(
        renderVerificationPage({
          success: false,
          title: "Verification Error",
          message: "An unexpected error occurred while verifying your email. Please try again later.",
          loginUrl,
        })
      );
    }

    return res.status(500).json({
      success: false,
      message: "Server error while verifying email.",
    });
  }
};

// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Prevent user enumeration: generic success if account does not exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a verification link has been sent.",
      });
    }

    // Already verified check
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email address is already verified. You can proceed to login.",
      });
    }

    // Generate fresh verification token & 24h expiration
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    const backendBaseUrl = getBackendBaseUrl(req);
    const verificationUrl =
      `${backendBaseUrl}/api/auth/verify-email/${verificationToken}`;

    const emailResult = await sendVerificationEmail({
      to: user.email,
      verifyUrl: verificationUrl,
      userName: user.fullName || "Valued Customer",
    });

    if (!emailResult.success) {
      console.error(
        "[AUTH] Resend verification email failed:",
        emailResult.errorCode,
        emailResult.errorDetail || emailResult.message
      );
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again shortly.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resending verification email.",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Email verification check
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login.",
      });
    }

    // Role synchronization: promote to admin if configured in ADMIN_EMAIL
    if (getAssignedRole(user.email) === "admin" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Create JWT
    const userRole = user.role === "admin" ? "admin" : "customer";
    const token = jwt.sign(
      {
        userId: user._id,
        role: userRole,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in.",
    });
  }
};
// ==========================================
// FORGOT PASSWORD
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Prevent user enumeration: always return the same generic message
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate cryptographically secure random 32-byte raw token
    const rawResetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token with SHA-256 for MongoDB persistence (never store raw token)
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(rawResetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = resetExpires;

    await user.save();

    // Construct secure reset link pointing to the configured frontend domain
    const frontendBaseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173";
    const resetUrl = `${frontendBaseUrl.replace(/\/$/, "")}/reset-password/${rawResetToken}`;

    // Send branded HTML email asynchronously without blocking or failing silently
    sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      userName: user.fullName || "Customer",
    }).catch((emailErr) => {
      console.error("[AUTH] Password reset email dispatch failed:", emailErr.message);
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while processing password reset.",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Compute SHA-256 hash of provided token to compare with database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link. Please request a new one.",
      });
    }

    // Securely hash new password with 12 bcrypt salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    // Invalidate reset token immediately (single use protection)
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, image } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (image !== undefined) user.image = image;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone,
        address: user.address,
        city: user.city,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if account uses local password
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password.",
    });
  }
};

// ==========================================
// CHANGE EMAIL (Admin / Customer Profile)
// ==========================================
export const changeEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Current password and new email are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.email === normalizedNewEmail) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from your current email.",
      });
    }

    // Verify current password if account has password
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
    }

    // Check if new email is already registered to another account
    const existing = await User.findOne({
      email: normalizedNewEmail,
      _id: { $ne: userId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email address is already in use by another account.",
      });
    }

    // Update email while preserving role unchanged in MongoDB
    user.email = normalizedNewEmail;
    await user.save();

    // Re-issue JWT session with updated email & preserved role
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email updated successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("CHANGE EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing email address.",
    });
  }
};

// ==========================================
// GOOGLE AUTH
// ==========================================
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // idToken is mandatory — we verify identity server-side
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required for Google login.",
      });
    }

    // Verify the Firebase idToken with Google's servers
    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseIdToken(idToken);
    } catch (verifyError) {
      console.error("Firebase token verification failed:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Google authentication failed. Invalid or expired token.",
      });
    }

    // Use verified data from Firebase, not from request body
    const verifiedEmail = (firebaseUser.email || "").toLowerCase().trim();
    const verifiedName = firebaseUser.displayName || "Google User";
    const verifiedImage = firebaseUser.photoUrl || "";

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve email from Google account.",
      });
    }

    let user = await User.findOne({ email: verifiedEmail });

    const assignedRole = getAssignedRole(verifiedEmail);

    if (!user) {
      user = await User.create({
        fullName: verifiedName,
        email: verifiedEmail,
        image: verifiedImage,
        role: assignedRole,
        authProvider: "google",
        emailVerified: true,
      });
    } else if (assignedRole === "admin" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const userRole = user.role === "admin" ? "admin" : "customer";
    const token = jwt.sign(
      {
        userId: user._id,
        role: userRole,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Google authentication.",
    });
  }
};