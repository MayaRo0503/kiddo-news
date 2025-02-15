import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(req: NextRequest) {
	try {
		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const stats = await RawArticle.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		const latestArticles = await RawArticle.find()
			.sort({ crawledAt: -1 })
			.limit(10)
			.select("title source status crawledAt");

		return NextResponse.json({
			stats,
			latestArticles,
		});
	} catch (error) {
		console.error("Error fetching crawler status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
