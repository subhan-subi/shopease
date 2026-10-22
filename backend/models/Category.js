import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    Cetagory: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
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
    icon: {
      type: String,
      default: "bi-grid-fill",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.firebaseId = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.firebaseId = ret._id.toString();
        return ret;
      },
    },
  }
);

categorySchema.index({ Cetagory: 1, subCetagory: 1, frsubCategory: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
