import api from "./api";

const mapOrder = (doc) => ({
  ...doc,
  firebaseId: (doc._id || doc.id || doc.firebaseId || "").toString(),
  firestoreId: (doc._id || doc.id || doc.firestoreId || "").toString(),
  id: (doc._id || doc.id || "").toString(),
});

// Add Order
export async function addOrder(order) {
  const response = await api.post("/orders", order);
  const created = response.data.data || {};
  return (response.data.orderId || created._id || created.id || "").toString();
}

// Get Orders
export async function getOrders() {
  const response = await api.get("/orders");
  const data = response.data.data || [];
  return data.map(mapOrder);
}

// Update Status
export async function updateOrderStatus(id, status) {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
}

// Update Payment Verification
export async function updateOrderPayment(id) {
  const response = await api.patch(`/orders/${id}/payment`);
  return response.data;
}

// Update Payment Status Manually
export async function updatePaymentStatus(id, status) {
  const response = await api.patch(`/orders/${id}/payment-status`, { status });
  return response.data;
}

// Delete Order
export async function deleteOrder(id) {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
}

// Singleton subscriber management for orders polling
let activeOrderTimer = null;
let isOrderFetchInProgress = false;
let cachedOrders = null;
const orderSubscribers = new Set();

const pollOrders = async () => {
  if (isOrderFetchInProgress) return;
  isOrderFetchInProgress = true;
  try {
    const orders = await getOrders();
    cachedOrders = orders;
    orderSubscribers.forEach((cb) => {
      try {
        cb(orders);
      } catch (err) {
        console.error("Order subscriber callback error:", err);
      }
    });
  } catch (err) {
    console.error("subscribeOrders poll error:", err);
  } finally {
    isOrderFetchInProgress = false;
  }
};

// Real-time / Polling Orders listener (Safe singleton poller)
export function subscribeOrders(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  orderSubscribers.add(callback);

  if (cachedOrders) {
    try {
      callback(cachedOrders);
    } catch (err) {
      console.error("subscribeOrders initial callback error:", err);
    }
  } else {
    pollOrders();
  }

  if (!activeOrderTimer) {
    activeOrderTimer = setInterval(pollOrders, 15000);
  }

  return () => {
    orderSubscribers.delete(callback);
    if (orderSubscribers.size === 0 && activeOrderTimer) {
      clearInterval(activeOrderTimer);
      activeOrderTimer = null;
    }
  };
}
