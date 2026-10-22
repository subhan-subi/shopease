import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductRating,
  reduceProductStock,
} from "../controllers/productController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", validateObjectId, getProductById);

// Admin-only mutation routes
router.post("/", authMiddleware, requireAdmin, createProduct);
router.put("/:id", validateObjectId, authMiddleware, requireAdmin, updateProduct);
router.delete("/:id", validateObjectId, authMiddleware, requireAdmin, deleteProduct);

// Rating & stock updates (admin-only — server handles these internally)
router.patch("/:id/rating", validateObjectId, authMiddleware, requireAdmin, updateProductRating);
router.patch("/:id/stock", validateObjectId, authMiddleware, requireAdmin, reduceProductStock);

export default router;
