import mongoose from "mongoose";

// Define the schema for child details
const childSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Child's name
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Articles saved by the child
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Articles liked by the child
  timeLimit: { type: Number, required: true }, // Time limit for child usage in minutes
});

// Define the schema for parent (user) details
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Parent's email
  password: { type: String, required: true }, // Parent's hashed password
  firstName: { type: String, required: true }, // Parent's first name
  lastName: { type: String, required: true }, // Parent's last name
  role: { type: String, enum: ["parent"], default: "parent" }, // Role is always "parent" for this schema
  child: { type: childSchema, required: true }, // Child details nested in parent schema
  createdAt: { type: Date, default: Date.now }, // Timestamp of user creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last update
  resetPasswordToken: { type: String, default: null }, // Token for password reset
  resetPasswordExpires: { type: Date, default: null }, // Expiry for the password reset token
});

// Add a pre-save hook to hash the password if it’s modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const bcrypt = await import("bcrypt"); // Dynamically import bcrypt to avoid issues with some environments
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as mongoose.CallbackError); // Explicitly cast error to CallbackError
  }
});

// Export the model (or reuse an existing one)
export default mongoose.models.User || mongoose.model("User", userSchema);
