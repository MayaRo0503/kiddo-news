import type { IUser, Child } from "@/types";
// import { isSameDay } from "date-fns";
import mongoose from "mongoose";

// Define the schema for child details
const childSchema = new mongoose.Schema<Child>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  timeLimit: { type: Number, required: true },
  timeSpent: { type: Number, default: null },
  sessionStartTime: { type: Date, default: null },
  approvedByParent: { type: Boolean, default: true },
  lastLoginDate: { type: Date, default: null },
  access_code: { type: String, default: null },
  avatar: { type: String, default: "star" },
  favoriteColor: { type: String, default: "#4ECDC4" },
  remainingTime: { type: Number, default: null }, // New field for remaining time

  birthDate: {
    type: Date,
    required: true,
    validate: {
      validator: (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        return age >= 5 && age <= 17;
      },
      message: "Child must be between 5 and 17 years old",
    },
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: { type: String, default: "child" },
});

// Add a virtual for calculating age
childSchema.virtual("age").get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});
childSchema.methods.calculateRemainingTime = function () {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = this.lastLoginDate ? new Date(this.lastLoginDate) : null;
    if (lastLogin) lastLogin.setHours(0, 0, 0, 0);

    if (!lastLogin || lastLogin.getTime() !== today.getTime()) {
      this.set("timeSpent", 0); // Use set to ensure Mongoose tracks the change
      this.set("lastLoginDate", today);
      this.set("remainingTime", this.timeLimit);
    }

    this.remainingTime = this.timeLimit - this.timeSpent;
    return this.remainingTime;
  } catch (error) {
    console.error("Error in calculateRemainingTime:", error);
    throw error;
  }
};

// Ensure virtuals are included when converting to JSON
childSchema.set("toJSON", { virtuals: true });
childSchema.set("toObject", { virtuals: true });

// User schema
const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["parent", "admin"], default: "parent" },
  child: childSchema,
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  verified: { type: Boolean, default: false },
});

// Pre-save hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const bcrypt = await import("bcrypt");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
