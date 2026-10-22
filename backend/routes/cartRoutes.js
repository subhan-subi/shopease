import express from "express";
import {
  getCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItemQty);
router.delete("/", clearCart);
router.delete("/:productId", removeCartItem);

export default router;
