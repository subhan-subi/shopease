import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Helper: Recalculate product rating & reviewCount
const recalculateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    const count = reviews.length;
    const avgRating =
      count > 0
        ? Number(
            (
              reviews.reduce((sum, item) => sum + Number(item.rating), 0) /
              count
            ).toFixed(1)
          )
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: count,
    }).catch(() => null);
  } catch (err) {
    console.error("RECALCULATE RATING ERROR:", err);
  }
};

// ==========================================
// ADD REVIEW
// ==========================================
export const addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      productId,
      orderId,
      rating,
      comment,
      userName,
      userEmail,
    } = req.body;

    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID, order ID, rating, and comment are required.",
      });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    // Check duplicate review
    const existing = await Review.findOne({
      userId,
      productId: productId.toString(),
      orderId: orderId.toString(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product for this order.",
      });
    }

    // Verify order exists and belongs to the authenticated user (anti-IDOR)
    const orderQuery = {
      $or: [
        { _id: orderId, user: userId },
        { userId: userId.toString(), "products.firebaseId": productId.toString() },
      ],
    };

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can only review products from your own verified orders.",
      });
    }

    const review = await Review.create({
      userId,
      productId: productId.toString(),
      orderId: orderId.toString(),
      rating: ratingNum,
      comment: comment.trim(),
      userName: userName || req.user.fullName || "Customer",
      userEmail: userEmail || req.user.email,
    });

    // Mark product as reviewed in order
    await Order.findOneAndUpdate(
      { _id: orderId, "products.firebaseId": productId },
      { $set: { "products.$.reviewed": true } }
    ).catch(() => null);

    // Recalculate average rating & reviewCount on product
    await recalculateProductRating(productId);

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: review,
      id: review._id,
    });
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product for this order.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while adding review.",
    });
  }
};

// ==========================================
// GET PRODUCT REVIEWS (Public)
// ==========================================
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId: productId.toString() }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product reviews.",
    });
  }
};

// ==========================================
// CHECK IF USER HAS REVIEWED
// ==========================================
export const checkUserReviewed = async (req, res) => {
  try {
    // Always use authenticated userId from JWT — never trust client-supplied userId
    const userId = req.user._id;
    const { productId, orderId } = req.query;

    if (!userId || !productId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "userId, productId, and orderId are required.",
      });
    }

    const review = await Review.findOne({
      userId,
      productId: productId.toString(),
      orderId: orderId.toString(),
    });

    return res.status(200).json({
      success: true,
      hasReviewed: !!review,
    });
  } catch (error) {
    console.error("CHECK USER REVIEWED ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking review status.",
    });
  }
};

// ==========================================
// GET ALL REVIEWS (Admin)
// ==========================================
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("GET ALL REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching all reviews.",
    });
  }
};

// ==========================================
// DELETE REVIEW (Admin)
// ==========================================
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Ownership check: allow only admin or review creator
    const isOwner =
      review.userId &&
      req.user &&
      review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(id);

    // Recalculate product rating
    if (review.productId) {
      await recalculateProductRating(review.productId);
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review.",
    });
  }
};

