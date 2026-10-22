import api from "./api";

// Helper: Ensure products have both firebaseId and id
const mapProduct = (item) => ({
  ...item,
  firebaseId: (item._id || item.id || item.firebaseId || "").toString(),
  id: (item._id || item.id || item.firebaseId || "").toString(),
});

// Add Product
export const addProduct = async (product) => {
  const response = await api.post("/products", product);
  return mapProduct(response.data.data);
};

// Get All Products
export const getProducts = async () => {
  const response = await api.get("/products");
  const data = response.data.data || [];
  return data.map(mapProduct);
};

// Update Product
export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return mapProduct(response.data.data);
};

// Update Product Rating
export const updateProductRating = async (productId, rating, reviewCount) => {
  const response = await api.patch(`/products/${productId}/rating`, {
    rating,
    reviewCount,
  });
  return mapProduct(response.data.data);
};

// Delete Product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Singleton subscriber management for products polling
let activeProductTimer = null;
let isProductFetchInProgress = false;
let cachedProducts = null;
const productSubscribers = new Set();

const pollProducts = async () => {
  if (isProductFetchInProgress) return;
  isProductFetchInProgress = true;
  try {
    const products = await getProducts();
    cachedProducts = products;
    productSubscribers.forEach((cb) => {
      try {
        cb(products);
      } catch (err) {
        console.error("Product subscriber callback error:", err);
      }
    });
  } catch (err) {
    console.error("subscribeProducts poll error:", err);
  } finally {
    isProductFetchInProgress = false;
  }
};

// Real-time / Polling Products listener (Safe singleton poller)
export function subscribeProducts(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  productSubscribers.add(callback);

  // If products are already in memory, serve immediately to avoid unnecessary fetch
  if (cachedProducts) {
    try {
      callback(cachedProducts);
    } catch (err) {
      console.error("subscribeProducts initial callback error:", err);
    }
  } else {
    pollProducts();
  }

  // Start single shared interval if not running (15s reasonable interval)
  if (!activeProductTimer) {
    activeProductTimer = setInterval(pollProducts, 15000);
  }

  return () => {
    productSubscribers.delete(callback);
    // Cleanup timer when no active subscribers exist
    if (productSubscribers.size === 0 && activeProductTimer) {
      clearInterval(activeProductTimer);
      activeProductTimer = null;
    }
  };
}

// Reduce Product Stock
export async function reduceProductStock(productId, qty) {
  const response = await api.patch(`/products/${productId}/stock`, { qty });
  return response.data;
}
