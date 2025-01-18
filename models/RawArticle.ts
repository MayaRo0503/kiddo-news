import mongoose from "mongoose";

const rawArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  author: {
    type: String,
  },
  source: {
    type: String,
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
    unique: true,
  },
  publishDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (v: Date) {
        return v instanceof Date && !isNaN(v.getTime());
      },
      message: "Invalid date format",
    },
  },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ["pending", "processed", "failed"],
    default: "pending",
  },
  processingError: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  category: {
    type: String,
    default: "Uncategorized",
  },
});

// Create indexes for better query performance
rawArticleSchema.index({ originalUrl: 1 });
rawArticleSchema.index({ publishDate: -1 });
rawArticleSchema.index({ status: 1 });

const RawArticle =
  mongoose.models.RawArticle || mongoose.model("RawArticle", rawArticleSchema);

export default RawArticle;
