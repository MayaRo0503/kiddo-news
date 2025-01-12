import mongoose from "mongoose";

// Define the schema for child details
const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  timeLimit: { type: Number, required: true },
  sessionStartTime: { type: Date, default: null },
  approvedByParent: { type: Boolean, default: false },
  lastLoginDate: { type: String, default: null },
  remainingTime: { type: Number, default: null },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Define the schema for parent (user) details
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["parent"], default: "parent" },
  child: { type: childSchema, required: true },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  verified: { type: Boolean, default: false },
});

// Add a pre-save hook to hash the password if it's modified
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

// Export the model (or reuse an existing one)
export default mongoose.models.User || mongoose.model("User", userSchema);
