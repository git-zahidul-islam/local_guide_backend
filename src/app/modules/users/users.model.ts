import { model, Schema } from "mongoose";
import { IUser, Role } from "./users.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.TOURIST,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },

    languages: [
      {
        type: String,
      },
    ],

    // GUIDE FIELDS
    expertise: [
      {
        type: String,
      },
    ],

    dailyRate: {
      type: Number,
      min: 0,
    },

    // TOURIST FIELDS
    travelPreferences: [
      {
        type: String,
      },
    ],

    // SYSTEM FIELDS
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
