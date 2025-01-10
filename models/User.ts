import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Child's name
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Articles saved by the child
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Articles liked by the child
  timeLimit: { type: Number, required: true }, // Time limit for child usage in minutes
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Parent's email
  password: { type: String, required: true }, // Parent's password
  firstName: { type: String, required: true }, // Parent's first name
  lastName: { type: String, required: true }, // Parent's last name
  role: { type: String, enum: ["parent"], default: "parent" }, // Role is always "parent" for this schema
  child: { type: childSchema, required: true }, // Child details nested in parent schema
  createdAt: { type: Date, default: Date.now }, // Timestamp of user creation
});

export default mongoose.models.User || mongoose.model("User", userSchema);
