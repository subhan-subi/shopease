import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Authorization header check
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Token extract
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Ensure role validity: preserve database admin role, or bootstrap from ADMIN_EMAIL
    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .toLowerCase()
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (user.role === "admin") {
      // Admin role is persisted in MongoDB and preserved
      user.role = "admin";
    } else if (adminEmails.includes(user.email?.toLowerCase())) {
      // Initial bootstrap admin elevation
      user.role = "admin";
      await user.save().catch(() => {});
    } else if (!user.role || !["customer", "admin"].includes(user.role)) {
      user.role = "customer";
    }

    // Attach user to request
    req.user = user;


    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Admin privileges required.",
    });
  }
  next();
};

export { authMiddleware };
export default authMiddleware;