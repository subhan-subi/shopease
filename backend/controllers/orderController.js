import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Notification from "../models/Notification.js";

// ==========================================
// CREATE ORDER
// ==========================================
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession().catch(() => null);

  const reducedProducts = [];

  try {
    const userId = req.user._id;
    const {
      customer,
      Email,
      phone,
      Address,
      City,
      Postal,
      payment,
      paymentStatus,
      paymentDetails,
      products,
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (!customer || !Email || !phone || !Address || !City || !payment) {
      return res.status(400).json({
        success: false,
        message: "Customer name, email, phone, address, city, and payment method are required.",
      });
    }

    // Validate and atomically reduce stock for each product
    for (const item of products) {
      const prodId = item.firebaseId || item.id || item._id;
      const qty = Number(item.qty) || 1;

      if (!prodId) continue;

      // Try finding product if prodId is valid ObjectId or search
      let productDoc = null;
      if (mongoose.Types.ObjectId.isValid(prodId)) {
        productDoc = await Product.findOneAndUpdate(
          { _id: prodId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
      }

      if (!productDoc) {
        // Fallback: search by title or other match if product existed
        productDoc = await Product.findOneAndUpdate(
          { Title: item.Title, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );
      }

      if (!productDoc) {
        // Rollback previously reduced stock
        for (const red of reducedProducts) {
          await Product.findByIdAndUpdate(red.id, { $inc: { stock: red.qty } });
        }

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.Title || prodId}`,
        });
      }

      reducedProducts.push({ id: productDoc._id, qty });
    }

    // Format products for order
    const formattedProducts = products.map((item) => ({
      product: mongoose.Types.ObjectId.isValid(item.firebaseId || item._id)
        ? item.firebaseId || item._id
        : null,
      firebaseId: (item.firebaseId || item._id || item.id || "").toString(),
      Title: item.Title || "",
      image: item.image || (item.images && item.images[0]) || "",
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      reviewed: false,
    }));

    const calculatedTotalProducts = formattedProducts.reduce(
      (sum, p) => sum + p.qty,
      0
    );
    const calculatedTotalAmount = formattedProducts.reduce(
      (sum, p) => sum + p.price * p.qty,
      0
    );

    const newOrder = await Order.create({
      user: userId,
      userId: userId.toString(),
      customer: customer.trim(),
      Email: Email.trim(),
      phone: phone.trim(),
      Address: Address.trim(),
      City: City.trim(),
      Postal: Postal ? Postal.trim() : "",
      status: "Pending",
      payment: payment,
      paymentStatus:
        paymentStatus ||
        (payment === "Cash on Delivery" ? "Unpaid" : "Verification Pending"),
      paymentDetails: {
        method: payment,
        transactionId: paymentDetails?.transactionId || null,
        verified: false,
      },
      products: formattedProducts,
      TotalProducts: calculatedTotalProducts,
      TotalAmount: calculatedTotalAmount,
      orderdate: new Date().toLocaleDateString(),
      ordertime: new Date().toLocaleTimeString(),
    });

    // Clear cart automatically for the user
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    // Create Admin Notification
    try {
      await Notification.create({
        role: "admin",
        title: "New Order Received",
        message: `New order #${newOrder._id} has been placed`,
        type: "order",
        orderId: newOrder._id.toString(),
        read: false,
      });
    } catch (notifErr) {
      console.error("NOTIFICATION CREATION ERROR:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      orderId: newOrder._id,
      data: newOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    // Rollback reduced stock on error
    for (const red of reducedProducts) {
      await Product.findByIdAndUpdate(red.id, { $inc: { stock: red.qty } }).catch(
        () => null
      );
    }

    return res.status(500).json({
      success: false,
      message: "Server error while placing order.",
    });
  }
};

// ==========================================
// GET ORDERS (Admin: all, Customer: own)
// ==========================================
export const getOrders = async (req, res) => {
  try {
    const isUserAdmin = req.user.role === "admin";
    let orders;

    if (isUserAdmin) {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        $or: [{ user: req.user._id }, { userId: req.user._id.toString() }],
      }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders.",
    });
  }
};

// ==========================================
// GET SINGLE ORDER BY ID
// ==========================================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // IDOR protection: only admin or owner
    const isOwner =
      order.user?.toString() === req.user._id.toString() ||
      order.userId === req.user._id.toString();

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. You do not own this order.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order.",
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}.`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const isOwner =
      order.user?.toString() === req.user._id.toString() ||
      order.userId === req.user._id.toString();

    // Customer can only cancel their own Pending order
    if (req.user.role !== "admin") {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden.",
        });
      }
      if (status !== "Cancelled" || order.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "You can only cancel orders that are still in Pending status.",
        });
      }
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status.",
    });
  }
};

// ==========================================
// UPDATE PAYMENT VERIFICATION (Admin)
// ==========================================
export const updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        "paymentDetails.verified": true,
        paymentStatus: "Paid",
        paymentVerifiedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order payment verified successfully.",
      data: order,
    });
  } catch (error) {
    console.error("UPDATE ORDER PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment.",
    });
  }
};

// ==========================================
// UPDATE PAYMENT STATUS (Admin)
// ==========================================
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    console.error("UPDATE PAYMENT STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating payment status.",
    });
  }
};

// ==========================================
// DELETE ORDER (Admin)
// ==========================================
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting order.",
    });
  }
};
