import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  updatePaymentStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.use(authMiddleware);

// Order creation & retrieval (Customers & Admins)
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", validateObjectId, getOrderById);

// Status update (Admin or customer cancelling their own pending order)
router.patch("/:id/status", validateObjectId, updateOrderStatus);

// Admin-only updates & deletion
router.patch("/:id/payment", validateObjectId, requireAdmin, updateOrderPayment);
router.patch("/:id/payment-status", validateObjectId, requireAdmin, updatePaymentStatus);
router.delete("/:id", validateObjectId, requireAdmin, deleteOrder);

export default router;
