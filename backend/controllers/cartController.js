import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ==========================================
// GET USER CART
// ==========================================
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return res.status(200).json({
      success: true,
      data: cart.items,
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart.",
    });
  }
};

// ==========================================
// ADD ITEM TO CART
// ==========================================
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { product } = req.body;

    if (!product || (!product.firebaseId && !product._id && !product.id)) {
      return res.status(400).json({
        success: false,
        message: "Valid product details are required.",
      });
    }

    const productId = (product.firebaseId || product._id || product.id).toString();

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.firebaseId === productId
    );

    const qtyToAdd = Number(product.qty) || 1;
    const itemPrice = Number(product.price) || 0;
    const itemStock = Number(product.stock) || 0;

    if (qtyToAdd < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    if (itemPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price.",
      });
    }

    const productObjectId = mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;

    if (existingIndex > -1) {
      cart.items[existingIndex].qty += qtyToAdd;
      if (!cart.items[existingIndex].product && productObjectId) {
        cart.items[existingIndex].product = productObjectId;
      }
    } else {
      cart.items.push({
        product: productObjectId,
        firebaseId: productId,
        Title: product.Title || "",
        image: product.image || (product.images && product.images[0]) || "",
        price: itemPrice,
        qty: qtyToAdd,
        stock: itemStock,
        added: true,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart.",
      data: cart.items,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to cart.",
    });
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================
export const updateCartItemQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { qty } = req.body;

    const newQty = Number(qty);
    if (!newQty || newQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.find(
      (i) => i.firebaseId === productId || String(i.product) === productId
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart.",
      });
    }

    item.qty = newQty;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated.",
      data: cart.items,
    });
  } catch (error) {
    console.error("UPDATE CART QTY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart item quantity.",
    });
  }
};

// ==========================================
// REMOVE SINGLE ITEM FROM CART
// ==========================================
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.firebaseId !== productId && String(item.product) !== productId
    );
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      data: cart.items,
    });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing item from cart.",
    });
  }
};

// ==========================================
// CLEAR ENTIRE CART
// ==========================================
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: [],
    });
  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while clearing cart.",
    });
  }
};
