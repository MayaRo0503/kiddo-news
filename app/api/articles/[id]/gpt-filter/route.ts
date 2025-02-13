import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { refilterArticle } from "@/lib/gptProcessor";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import RawArticle, { type IRawArticle } from "@/models/RawArticle";
// import { Article } from "@/types/Article";

interface RefilterRequestBody {
	adminComments: string;
	targetAgeRange: string;
}

export async function POST(
	req: NextRequest & { json: () => Promise<RefilterRequestBody> },
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();

		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existingArticle = await RawArticle.findById(id);
		if (!existingArticle) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		const { adminComments, targetAgeRange } = await req.json();

		// Only refilter if the article was previously approved
		if (existingArticle.adminReviewStatus === "approved") {
			await refilterArticle(existingArticle, adminComments, targetAgeRange);
			// After re-filtering, mark it so it needs re-approval
			await RawArticle.findByIdAndUpdate(id, {
				$set: {
					status: "pending", // <-- CHANGED
					adminComments,
					targetAgeRange: targetAgeRange.toString(),
					adminReviewStatus: "pending",
				} satisfies Partial<IRawArticle>,
			});
		} else {
			// If the article is not yet approved but you still want to queue it
			// you can leave it as "pre_filtered" or any logic you prefer:
			await RawArticle.findByIdAndUpdate(id, {
				$set: {
					status: "pending",
					adminComments,
					targetAgeRange: targetAgeRange.toString(),
					adminReviewStatus: "pending",
				} satisfies Partial<IRawArticle>,
			});
		}

		return NextResponse.json({
			message: "Article queued for processing",
			article: existingArticle,
		});
	} catch (error) {
		console.error("Error processing article with GPT:", error);

		if (error instanceof Error) {
			if (
				error.message.includes("429") ||
				error.message.includes("Too Many Requests")
			) {
				return NextResponse.json(
					{ error: "Rate limit reached. Please try again later." },
					{ status: 429 },
				);
			}
			if (error.message === "API temporarily unavailable") {
				return NextResponse.json(
					{
						error:
							"API service temporarily unavailable. Please try again later.",
					},
					{ status: 503 },
				);
			}
		}

		return NextResponse.json(
			{
				error: "Internal Server Error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
