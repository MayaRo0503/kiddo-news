// app/api/articles/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle, { type IRawArticle } from "@/models/RawArticle";
import { ObjectId } from "bson";
import { authenticateToken } from "../../auth/common/middleware";
import { Article } from "@/types/Article";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();
		const user = authenticateToken(req);
		const { id } = await params;

		// Ensure the id is a valid MongoDB ObjectId
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: "Invalid article ID" },
				{ status: 404 },
			);
		}

		const article = await RawArticle.findOne<IRawArticle>({
			_id: new ObjectId(id),
		});

		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}
		if (article?.adminReviewStatus !== "approved" && user?.role !== "admin") {
			return NextResponse.json(
				{ error: "Article not viewable" },
				{ status: 401 },
			);
		}

		// Return all necessary fields including likes, saves, and comments.
		const responseData = {
			_id: article._id.toString(),
			title: article.title,
			author: article.author,
			publishDate: article.publishDate,
			gptAnalysis: {
				summarySentences: article.gptAnalysis?.summarySentences || [],
			},
			keyPhrases: article.gptAnalysis?.keyPhrases || [],
			content: article.gptSummary,
			gptSummary: article.gptSummary,
			sentiment: article.gptAnalysis?.sentiment,
			relevance: article.gptAnalysis?.relevance,
			entities: article.gptAnalysis?.entities || [],
			status: article.status,
			likes: article.likes || 0,
			saves: article.saves || 0,
			comments: article.comments || [],
			isLiked: false,
			isSaved: false,
		};

		// If the current user is a child (or admin), return like/save status
		if (user?.role === "child" || user?.role === "admin") {
			responseData.isLiked = user.child?.likedArticles.includes(id) || false;
			responseData.isSaved = user.child?.savedArticles.includes(id) || false;
		}

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Error fetching article:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();
		const user = authenticateToken(req);
		const { id } = await params;

		if (user?.role !== "admin") {
			return NextResponse.json(
				{ error: "Unauthorized to edit articles" },
				{ status: 401 },
			);
		}

		// Ensure the id is a valid MongoDB ObjectId
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: "Invalid article ID" },
				{ status: 404 },
			);
		}

		const body = await req.json();

		const article = await RawArticle.findOne<IRawArticle>({
			_id: new ObjectId(id),
		});

		if (!article) {
			return NextResponse.json(
				{ error: "Article not found" },
				{
					status: 404,
				},
			);
		}

		if (body.title) {
			article.title = body.title;
		}
		if (body.content) {
			article.gptSummary = body.content;
			article.content = body.content;
		}
		await article.save();

		return NextResponse.json({ error: null }, { status: 201 });
	} catch (e: unknown) {
		console.error(e);
		return NextResponse.json(
			{ error: "Could not update the article right now" },
			{ status: 400 },
		);
	}
}
