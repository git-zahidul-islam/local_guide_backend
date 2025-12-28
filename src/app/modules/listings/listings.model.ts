import { Schema, model } from "mongoose";

const listingSchema = new Schema(
  {
    guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    itinerary: { type: String },

    city: { type: String, required: true },
    category: { type: String, required: true },

    fee: { type: Number, required: true },
    duration: { type: Number, required: true },
    meetingPoint: { type: String, required: true },
    maxGroupSize: { type: Number, required: true },

    images: [String],
    language: String,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const Listing = model("Listing", listingSchema);
export default Listing;
