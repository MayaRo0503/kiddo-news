import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ["Technology", "History", "Mathematics", "Culture"],
    required: true,
  },
  image: { type: String, required: true },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  comments: [
    {
      user: { type: String, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.Article ||
  mongoose.model("Article", ArticleSchema);
