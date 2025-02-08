// fullApp/app/api/articles/[id]/admin-review/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		await dbConnect();

		const user = await authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = params;

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
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		await dbConnect();

		const user = await authenticateToken(req);
		console.log(user);
		return;
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = params;
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

		await article.save();

		return NextResponse.json({ message: "Article review completed" });
	} catch (error) {
		console.error("Error reviewing article:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
