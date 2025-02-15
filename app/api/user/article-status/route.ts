import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();
		const { articleId } = await req.json();

		const user = authenticateToken(req);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const parentUser = await User.findById(user.userId);
		if (!parentUser || !parentUser.child) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const article = await RawArticle.findById(articleId);
		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		const isLiked = parentUser.child.likedArticles.includes(articleId);
		const isSaved = parentUser.child.savedArticles.includes(articleId);

		return NextResponse.json({
			isLiked,
			isSaved,
			likes: article.likes || 0,
			saves: article.saves || 0,
		});
	} catch (error) {
		console.error("Error checking article status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
