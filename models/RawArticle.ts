// fullApp/models/RawArticle.ts

import mongoose, { type Document, type Model } from "mongoose";

export interface IRawArticle extends Document {
	_id: mongoose.Types.ObjectId;
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
	gptAnalysis: GPTAnalysis;
	relevanceScore: number;
	ageRange: string;
	adminNotes?: string;
	// New fields for admin review
	adminReviewStatus: "pending" | "approved" | "rejected";
	adminComments: string;
	targetAgeRange: string;
}

export interface GPTAnalysis {
	relevance: number;
	sentiment: "positive" | "negative" | "neutral";
	keyPhrases: string[];
	entities: Array<{ name: string; type: string }>;
	summarySentences: string[];
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
			validator: (v: Date) => v instanceof Date && !Number.isNaN(v.getTime()),
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
	ageRange: { type: String },
	adminNotes: { type: String },
	// New fields for admin review
	adminReviewStatus: {
		type: String,
		enum: ["pending", "approved", "rejected"],
		default: "pending",
	},
	adminComments: { type: String, default: "" },
	targetAgeRange: { type: String, default: "" },
});

// Create indexes for better query performance
rawArticleSchema.index({ publishDate: -1 });
rawArticleSchema.index({ status: 1 });
rawArticleSchema.index({ keywords: 1 });
rawArticleSchema.index({ sentiment: 1 });
rawArticleSchema.index({ relevanceScore: -1 });
// New index for admin review status
rawArticleSchema.index({ adminReviewStatus: 1 });

const RawArticle: Model<IRawArticle> =
	mongoose.models.RawArticle ||
	mongoose.model<IRawArticle>("RawArticle", rawArticleSchema);

export default RawArticle;
