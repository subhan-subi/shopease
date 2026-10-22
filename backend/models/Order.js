import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    firebaseId: {
      type: String,
      required: true,
    },
    Title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    Address: {
      type: String,
      required: true,
      trim: true,
    },
    City: {
      type: String,
      required: true,
      trim: true,
    },
    Postal: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    payment: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Unpaid",
      index: true,
    },
    paymentDetails: {
      method: {
        type: String,
        default: "",
      },
      transactionId: {
        type: String,
        default: null,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    products: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "Order must contain at least one product",
      ],
    },
    TotalProducts: {
      type: Number,
      required: true,
      min: 1,
    },
    TotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderdate: {
      type: String,
      default: () => new Date().toLocaleDateString(),
    },
    ordertime: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.firebaseId = ret._id.toString();
        ret.firestoreId = ret._id.toString();
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.firebaseId = ret._id.toString();
        ret.firestoreId = ret._id.toString();
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
