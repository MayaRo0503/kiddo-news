import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

/**
 * POST /api/articles/[id]/comments
 *
 * This endpoint allows an authenticated child to post a comment (response)
 * on a specific article.
 *
 * Expected request body:
 * {
 *   "content": "Your comment text..."
 * }
 *
 * The new comment object will include:
 * - content: the comment text
 * - author: the child's username
 * - authorId: the child's _id (from the parent's embedded child document)
 * - createdAt: the current date and time
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Connect to MongoDB.
		await dbConnect();

		// Authenticate the request.
		const user = authenticateToken(req);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Ensure that only a child can post a comment.
		if (user.role !== "child") {
			return NextResponse.json(
				{ error: "Access restricted to children only" },
				{ status: 403 },
			);
		}

		// Fetch the parent document which holds the embedded child.
		const parent = await User.findById(user.userId);
		if (!parent || !parent.child) {
			return NextResponse.json(
				{ error: "Child profile not found" },
				{ status: 404 },
			);
		}

		// Find the article by its id.
		const article = await RawArticle.findById((await params).id);
		if (!article) {
			return NextResponse.json({ error: "Article not found" }, { status: 404 });
		}

		// Retrieve the comment content from the request body.
		const { content } = await req.json();
		if (!content || content.trim() === "") {
			return NextResponse.json(
				{ error: "Comment content is required" },
				{ status: 400 },
			);
		}

		// Create a new comment object.
		// Note: In our RawArticle schema the comment fields are:
		// - content
		// - author (child's username)
		// - authorId (child's ObjectId)
		// - createdAt (date/time of response)
		const newComment = {
			content: content.trim(),
			author: parent.child.username, // child's username from the parent's embedded child object
			authorId: parent.child._id, // child's _id
			createdAt: new Date(),
		};

		// Append the new comment to the article's comments array.
		article.comments.push(newComment);

		// Save the article to update the comments.
		await article.save();

		// Return the new comment with a 201 status code.
		return NextResponse.json(newComment, { status: 201 });
	} catch (error) {
		console.error("Error posting comment:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
