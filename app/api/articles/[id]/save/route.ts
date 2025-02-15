import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import type { ObjectId } from "mongoose";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();
		const { save } = await req.json(); // Expect true to add save, false to remove

		// Verify the token from the request headers.
		const user = authenticateToken(req);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Ensure only a child can update saves.
		if (user.role !== "child") {
			return NextResponse.json(
				{ error: "Access restricted to children only" },
				{ status: 403 },
			);
		}

		// Fetch the parent's document containing the embedded child.
		const parent = await User.findById(user.userId);
		if (!parent || !parent.child) {
			return NextResponse.json(
				{ error: "Child profile not found" },
				{ status: 404 },
			);
		}

		// Find the article by its ID.
		const article = await RawArticle.findById((await params).id);
		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		// Convert the article ID to string.
		const articleIdStr = article._id.toString();

		// Check if the article is already saved by filtering the actual ObjectId array.
		const alreadySaved = parent.child.savedArticles.some(
			(id: string | ObjectId) => id.toString() === articleIdStr,
		);

		if (save && !alreadySaved) {
			// Add the article's ObjectId to the child's savedArticles and increment saves.
			parent.child.savedArticles.push(article._id);
			article.saves = (article.saves || 0) + 1;
		} else if (!save && alreadySaved) {
			// Remove the article's ObjectId by filtering the existing array.
			parent.child.savedArticles = parent.child.savedArticles.filter(
				(id: string | ObjectId) => id.toString() !== articleIdStr,
			);
			article.saves = Math.max((article.saves || 0) - 1, 0);
		}

		await parent.save();
		await article.save();

		return NextResponse.json({
			message: "Save updated successfully",
			saves: article.saves,
		});
	} catch (error) {
		console.error("Error updating saves:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
