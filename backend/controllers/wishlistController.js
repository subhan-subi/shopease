import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";

// ==========================================
// GET USER WISHLIST
// ==========================================
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await Wishlist.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist.",
    });
  }
};

// ==========================================
// ADD TO WISHLIST
// ==========================================
export const addToWishlist = async (req, res) => {
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

    // Check if item already in wishlist
    let existingItem = await Wishlist.findOne({
      user: userId,
      firebaseId: productId,
    });

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Item already in wishlist.",
        data: existingItem,
      });
    }

    const productObjectId = mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;

    const item = await Wishlist.create({
      user: userId,
      product: productObjectId,
      firebaseId: productId,
      Title: product.Title || "",
      image: product.image || (product.images && product.images[0]) || "",
      price: Number(product.price) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Item added to wishlist.",
      data: item,
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist.",
    });
  }
};

// ==========================================
// REMOVE FROM WISHLIST
// ==========================================
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const isHex24 = mongoose.Types.ObjectId.isValid(productId);
    await Wishlist.findOneAndDelete({
      user: userId,
      $or: [
        { firebaseId: productId },
        ...(isHex24 ? [{ _id: productId }, { product: productId }] : []),
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from wishlist.",
    });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist.",
    });
  }
};
