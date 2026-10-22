import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "email",
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    senderName: {
      type: String,
      trim: true,
      default: "ShopEase",
    },
    replyToEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate settings documents for the same key
systemSettingSchema.index({ key: 1 }, { unique: true });

export default mongoose.model("SystemSetting", systemSettingSchema);
