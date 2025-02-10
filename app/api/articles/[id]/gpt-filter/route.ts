import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { refilterArticle } from "@/lib/gptProcessor";
import { authenticateToken } from "@/app/api/auth/common/middleware";
import RawArticle, { IRawArticle } from "@/models/RawArticle";
import { Article } from "@/types/Article";

interface RefilterRequestBody {
	adminComments: string;
	targetAgeRange: string;
}

export async function POST(
	req: Request & { json: () => Promise<RefilterRequestBody> },
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();

		const user = await authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existingArticle = await RawArticle.findById(id);
		if (!existingArticle) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		const { adminComments, targetAgeRange } = await req.json();
		
		await refilterArticle(existingArticle, adminComments, targetAgeRange);

		await RawArticle.findByIdAndUpdate(id, {
			$set: {
				status: "pre_filtered",
				adminComments,
				targetAgeRange: targetAgeRange.toString(),
				adminReviewStatus: "pending"
			} satisfies Partial<IRawArticle>,
		});

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
