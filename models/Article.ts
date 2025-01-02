import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ["Technology", "History", "Mathematics", "Culture"], // Enum categories
    required: true,
  },
  image: { type: String, required: true },
});

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
  category: "Technology" | "History" | "Mathematics" | "Culture"; // Use the enum types here
  image: string;
}

const Article =
  mongoose.models.Article || mongoose.model("Article", ArticleSchema);

export default Article;
