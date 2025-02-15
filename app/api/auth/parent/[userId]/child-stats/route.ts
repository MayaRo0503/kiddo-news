// app/api/auth/parent/[userId]/child-stats/route.ts
import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		// Connect to the database
		await dbConnect();

		// Extract the userId from the route parameters
		const { userId } = await params;

		// Authenticate the parent (using the same pattern as in your working POST endpoint)
		const user = authenticateToken(req);
		if (!user || user.role !== "parent" || user.userId !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized access" },
				{ status: 401 },
			);
		}

		// Fetch parent document including the child's embedded data
		const parent = await User.findById(userId).lean();
		if (!parent || !parent.child) {
			return NextResponse.json(
				{ error: "Child profile not found" },
				{ status: 404 },
			);
		}

		const child = parent.child;

		// Convert article IDs to ObjectId (only if they are stored as strings)
		const savedArticleObjectIds =
			child.savedArticles?.map((id: string) => id) || [];
		const likedArticleObjectIds =
			child.likedArticles?.map((id: string) => id) || [];

		// Fetch articles from the correct collection (rawarticles)
		const savedArticles = savedArticleObjectIds.length
			? await RawArticle.find({ _id: { $in: savedArticleObjectIds } })
					.select("_id title")
					.lean()
			: [];

		const likedArticles = likedArticleObjectIds.length
			? await RawArticle.find({ _id: { $in: likedArticleObjectIds } })
					.select("_id title")
					.lean()
			: [];

		return NextResponse.json({
			message: "Child statistics fetched successfully",
			stats: {
				username: child.username,
				lastLogin: child.lastLoginDate,
				timeSpent: child.timeLimit - (child.timeRemaining || 0),
				timeLimit: child.timeLimit,
				access_code: child.access_code,
				likedArticles,
				savedArticles,
			},
		});
	} catch (error) {
		console.error("Error fetching child statistics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch child statistics" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		await dbConnect();

		const user = authenticateToken(req);
		if (!user || user.role !== "child") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const parent = await User.findById(user.userId);
		if (!parent?.child) {
			return NextResponse.json({ error: "Child not found" }, { status: 404 });
		}

		const child = parent.child;
		const now = new Date();

		// Only update timeSpent if there's an active session
		if (child.sessionStartTime) {
			// Calculate time spent in the current session
			const elapsedMinutes = Math.floor(
				(now.getTime() - child.sessionStartTime.getTime()) / (1000 * 60),
			);

			// Add elapsed time to total time spent
			child.timeSpent = (child.timeSpent || 0) + elapsedMinutes;

			// End the session
			child.sessionStartTime = null;

			// Save the updated document
			await parent.save();
		}

		return NextResponse.json({
			message: "Session ended successfully",
			timeSpent: child.timeSpent,
		});
	} catch (error) {
		console.error("Error ending session:", error);
		return NextResponse.json(
			{ error: "Failed to end session" },
			{ status: 500 },
		);
	}
}
