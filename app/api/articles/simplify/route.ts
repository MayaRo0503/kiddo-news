import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import OpenAI from "openai";
import { authenticateToken } from "@/app/api/auth/common/middleware";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
	try {
		await dbConnect();

		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const articles = await Article.find({ status: "simplified" });

		return NextResponse.json(articles);
	} catch (error) {
		console.error("Error fetching articles for admin:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { articleId, action, rejectionReason, adminInstructions, ageRange } =
			await req.json();

		const article = await Article.findById(articleId);
		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		if (action === "approve") {
			// Approve the article
			article.status = "approved";
			if (ageRange) {
				article.ageRange = ageRange; // Assign the appropriate age range
			}
		} else if (action === "reject") {
			// Reject the article
			article.status = "rejected";
			article.rejectionReason = rejectionReason || "No reason provided";
			if (adminInstructions) {
				article.adminInstructions = adminInstructions;
			}
		} else if (action === "resend") {
			// Send back to GPT for refinement based on admin instructions
			if (!adminInstructions) {
				return NextResponse.json(
					{ error: "Admin instructions are required to resend an article" },
					{ status: 400 },
				);
			}

			const prompt = `
        Refine the following article based on the admin's feedback:
        Feedback: ${adminInstructions}\n\n
        ${article.simplifiedContent}`;

			const completion = await openai.completions.create({
				model: "text-davinci-002",
				prompt,
				max_tokens: 1000,
			});

			const refinedContent = completion.choices[0]?.text?.trim();
			if (!refinedContent) {
				return NextResponse.json(
					{ error: "Failed to refine the article content" },
					{ status: 500 },
				);
			}

			// Update the article with the refined content
			article.simplifiedContent = refinedContent;
			article.status = "simplified"; // Reset status to "simplified" for further review
		} else {
			return NextResponse.json(
				{
					error:
						"Invalid action. Action must be 'approve', 'reject', or 'resend'",
				},
				{ status: 400 },
			);
		}

		await article.save();

		return NextResponse.json({ message: "Article updated successfully" });
	} catch (error) {
		console.error("Error updating article:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
