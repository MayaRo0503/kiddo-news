import mongoose, { Document, Model } from "mongoose";

interface IRawArticle extends Document {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  originalUrl: string;
  publishDate: Date;
  images: string[];
  status: "pre_filtered" | "gpt_filtered" | "pending" | "processed" | "failed";
  processingError: string;
  lastUpdated: Date;
  category: string;
  keywords: string[];
  sentiment: "positive" | "negative" | "neutral";
  gptSummary: string;
  gptAnalysis: never;
  relevanceScore: number;
}

const rawArticleSchema = new mongoose.Schema<IRawArticle>({
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
    enum: ["pre_filtered", "gpt_filtered", "pending", "processed", "failed"],
    default: "pre_filtered",
  },
  processingError: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  category: {
    type: String,
    default: "Uncategorized",
  },
  keywords: [{ type: String }],
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    default: "neutral",
  },
  gptSummary: { type: String },
  gptAnalysis: { type: mongoose.Schema.Types.Mixed },
  relevanceScore: { type: Number, min: 0, max: 1 },
});

// Create indexes for better query performance
rawArticleSchema.index({ originalUrl: 1 });
rawArticleSchema.index({ publishDate: -1 });
rawArticleSchema.index({ status: 1 });
rawArticleSchema.index({ keywords: 1 });
rawArticleSchema.index({ sentiment: 1 });
rawArticleSchema.index({ relevanceScore: -1 });

const RawArticle: Model<IRawArticle> =
  mongoose.models.RawArticle ||
  mongoose.model<IRawArticle>("RawArticle", rawArticleSchema);

export default RawArticle;
