import api from "./api";

const mapWishlistItem = (item) => ({
  ...item,
  id: (item._id || item.id || item.firebaseId || "").toString(),
  firebaseId: (item.firebaseId || item._id || item.id || "").toString(),
});

// ADD TO WISHLIST
export async function addWishlistItem(uid, product) {
  const response = await api.post("/wishlist", {
    product: {
      ...product,
      firebaseId: (product.firebaseId || product._id || product.id || "").toString(),
    },
  });
  return response.data;
}

// REMOVE FROM WISHLIST
export async function removeWishlistItem(uid, id) {
  const response = await api.delete(`/wishlist/${id}`);
  return response.data;
}

// GET WISHLIST ITEMS
export async function getWishlistItems(uid) {
  const response = await api.get("/wishlist");
  const data = response.data.data || [];
  return data.map(mapWishlistItem);
}
