import api from "./api";

const mapReview = (doc) => ({
  ...doc,
  id: (doc._id || doc.id || "").toString(),
  firestoreId: (doc._id || doc.id || "").toString(),
  firebaseId: (doc._id || doc.id || "").toString(),
});

export async function addReview(reviewData) {
  try {
    const response = await api.post("/reviews", reviewData);
    return {
      success: true,
      id: response.data.id || response.data.data?._id,
    };
  } catch (error) {
    console.error("addReview error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function getProductReviews(productId) {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    const data = response.data.data || [];
    return data.map(mapReview);
  } catch (error) {
    console.error("getProductReviews error:", error);
    return [];
  }
}

export async function hasUserReviewed(userId, productId, orderId) {
  try {
    const response = await api.get("/reviews/check", {
      params: { userId, productId, orderId },
    });
    return response.data.hasReviewed;
  } catch (error) {
    console.error("hasUserReviewed error:", error);
    return false;
  }
}

export async function getAllReviews() {
  try {
    const response = await api.get("/reviews");
    const data = response.data.data || [];
    return data.map(mapReview);
  } catch (error) {
    console.error("getAllReviews error:", error);
    throw error;
  }
}

export async function deleteReview(reviewId) {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("deleteReview error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}
