import api from "./api";

const mapNotification = (doc) => ({
  ...doc,
  id: (doc._id || doc.id || "").toString(),
  firebaseId: (doc._id || doc.id || "").toString(),
});

export async function addNotification(data) {
  try {
    const response = await api.post("/notifications", data);
    return response.data;
  } catch (error) {
    console.error("addNotification error:", error);
    return null;
  }
}

export async function getAdminNotifications() {
  try {
    const response = await api.get("/notifications");
    const data = response.data.data || [];
    return data.map(mapNotification);
  } catch (error) {
    console.error("getAdminNotifications error:", error);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("markNotificationRead error:", error);
    return null;
  }
}
