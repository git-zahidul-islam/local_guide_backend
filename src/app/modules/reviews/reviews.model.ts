import mongoose, { Schema, Types, model } from "mongoose";

export interface IReview {
  listing: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate reviews
reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
