import express from "express";
import {
  addReview,
  getProductReviews,
  checkUserReviewed,
  getAllReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

// Public review retrieval
router.get("/product/:productId", getProductReviews);

// Check if user has reviewed (auth optional or protected)
router.get("/check", authMiddleware, checkUserReviewed);

// Add review (authenticated user)
router.post("/", authMiddleware, addReview);

// Admin-only review management
router.get("/", authMiddleware, requireAdmin, getAllReviews);

// Review deletion (Admin or review author)
router.delete("/:id", validateObjectId, authMiddleware, deleteReview);

export default router;
