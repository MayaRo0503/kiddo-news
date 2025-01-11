import mongoose from "mongoose";

// Define the schema for child details
const childSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Child's name
  username: { type: String, required: true, unique: true }, // Unique child username
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Saved articles
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Liked articles
  timeLimit: { type: Number, required: true }, // Time limit in minutes
  sessionStartTime: { type: Date, default: null }, // Session start time for tracking
  approvedByParent: { type: Boolean, default: false }, // Parental approval status
  lastLoginDate: { type: String, default: null }, // Tracks last login day (YYYY-MM-DD)
  remainingTime: { type: Number, default: null }, // Remaining daily time in minutes
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Link to parent
  },
});

// Define the schema for parent (user) details
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Parent's email
  password: { type: String, required: true }, // Parent's hashed password
  firstName: { type: String, required: true }, // Parent's first name
  lastName: { type: String, required: true }, // Parent's last name
  role: { type: String, enum: ["parent"], default: "parent" }, // Role is always "parent"
  child: { type: childSchema, required: true }, // Nested child details
  lastLogin: { type: Date, default: null }, // Timestamp of parent's last login
  createdAt: { type: Date, default: Date.now }, // Timestamp of user creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
  resetPasswordToken: { type: String, default: null }, // Token for password reset
  resetPasswordExpires: { type: Date, default: null }, // Expiry for the password reset token
  verified: { type: Boolean, default: false }, // New field for email verification
});

// Add a pre-save hook to hash the password if it’s modified
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
