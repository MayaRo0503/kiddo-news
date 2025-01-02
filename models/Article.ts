import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Article ||
  mongoose.model("Article", articleSchema);
