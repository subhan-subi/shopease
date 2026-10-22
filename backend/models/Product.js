import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    Title2: {
      type: String,
      trim: true,
      default: "",
    },
    Discription: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    Cetagory: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    subCetagory: {
      type: String,
      trim: true,
      default: "",
    },
    frsubCategory: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },
    added: {
      type: Boolean,
      default: false,
    },
    qty: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.firebaseId = ret._id.toString();
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.firebaseId = ret._id.toString();
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

productSchema.index({ Title: "text", Cetagory: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
