import mongoose from "mongoose";

// Wishlist Model
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for quick lookup
wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });
export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
