import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryBranch,
  deleteCategoryBranch,
} from "../controllers/categoryController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

// Public read routes
router.get("/", getCategories);
router.get("/:id", validateObjectId, getCategoryById);

// Admin batch routes (must be placed before /:id routes)
router.put("/branch/update", authMiddleware, requireAdmin, updateCategoryBranch);
router.post("/branch/delete", authMiddleware, requireAdmin, deleteCategoryBranch);

// Admin-only mutation routes
router.post("/", authMiddleware, requireAdmin, createCategory);
router.put("/:id", validateObjectId, authMiddleware, requireAdmin, updateCategory);
router.delete("/:id", validateObjectId, authMiddleware, requireAdmin, deleteCategory);

export default router;
