import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();

		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const article = await RawArticle.findById(id).select(
			"title gptSummary ageRange relevanceScore status adminReviewStatus adminComments",
		);

		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		return NextResponse.json(article);
	} catch (error) {
		console.error("Error fetching article for review:", error);
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

		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const { action, adminNotes, adminComments, targetAgeRange } =
			await req.json();

		const article = await RawArticle.findById(id);
		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		if (action === "approve") {
			article.status = "processed";
			article.adminReviewStatus = "approved";
		} else if (action === "reject") {
			article.status = "failed";
			article.adminReviewStatus = "rejected";
			article.processingError = "Rejected by admin";
		} else {
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		article.adminNotes = adminNotes;
		article.adminComments = adminComments;

		// Only update targetAgeRange if it's provided and different from the current ageRange
		if (targetAgeRange && targetAgeRange !== article.ageRange) {
			article.ageRange = targetAgeRange;
		}

		const savedArticle = await article.save();
		console.log("savedArticle", savedArticle);

		return NextResponse.json({
			message: "Article review completed",
			article: savedArticle,
		});
	} catch (error) {
		console.error("Error reviewing article:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
