export function calculateTotalPrice(cartItems) {
  return cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );
}