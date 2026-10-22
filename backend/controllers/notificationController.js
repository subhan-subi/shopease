import Notification from "../models/Notification.js";

// ==========================================
// GET ADMIN NOTIFICATIONS
// ==========================================
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: "admin" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notification.",
    });
  }
};

// ==========================================
// CREATE NOTIFICATION (Admin or system)
// ==========================================
export const addNotification = async (req, res) => {
  try {
    const { title, message, role = "admin", type = "order", orderId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Notification title and message are required.",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      role,
      type,
      orderId: orderId || null,
      read: false,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created.",
      data: notification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating notification.",
    });
  }
};
