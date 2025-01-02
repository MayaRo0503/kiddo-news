import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  childName: String,
  timeLimit: Number,
  savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Child's saved articles
  likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // Child's liked articles
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ["parent", "child"], default: "child" }, // Parent/Child Role
});

export default mongoose.models.User || mongoose.model("User", userSchema);
