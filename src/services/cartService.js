import api from "./api";

const mapCartItem = (item) => ({
  ...item,
  firebaseId: (item.firebaseId || item._id || item.id || "").toString(),
});

// ADD TO CART
export async function addCartItem(uid, product) {
  const response = await api.post("/cart", {
    product: {
      ...product,
      firebaseId: (product.firebaseId || product._id || product.id || "").toString(),
    },
  });
  const data = response.data.data || [];
  return data.map(mapCartItem);
}

// REMOVE CART ITEM
export async function removeCartItem(uid, id) {
  const response = await api.delete(`/cart/${id}`);
  return response.data;
}

// GET CART ITEMS
export async function getCartItems(uid) {
  const response = await api.get("/cart");
  const data = response.data.data || [];
  return data.map(mapCartItem);
}

// UPDATE CART QUANTITY
export async function updateCartQty(uid, id, qty) {
  const response = await api.patch(`/cart/${id}`, { qty });
  return response.data;
}

// CLEAR CART
export async function clearCart(uid) {
  const response = await api.delete("/cart");
  return response.data;
}
