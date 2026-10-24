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

// Note: `unique: true` on the `key` field already creates a unique index;
// the explicit index() call below is intentionally removed to avoid the duplicate.

export default mongoose.model("SystemSetting", systemSettingSchema);
