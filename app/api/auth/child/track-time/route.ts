import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "../../common/middleware";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();
		const user = authenticateToken(req);

		const username = user?.username as string;
		if (!username) {
			return NextResponse.json(
				{ error: "Username not found" },
				{ status: 404 },
			);
		}

		const parent = await User.findOne({ "child.username": username });

		if (!parent) {
			return NextResponse.json({ error: "Child not found" }, { status: 404 });
		}

		const child = parent.child;
		if (!child) {
			return NextResponse.json({ error: "Invalid username" }, { status: 401 });
		}

		if (child.remainingTime <= 0) {
			child.sessionStartTime = null; // End session
			await parent.save();
			return NextResponse.json(
				{ message: "Session expired", remainingTime: 0 },
				{ status: 200 },
			);
		}

		return NextResponse.json({ remainingTime: child.remainingTime });
	} catch (error) {
		console.error("Error tracking time:", error);
		return NextResponse.json(
			{ error: "Failed to track time" },
			{ status: 500 },
		);
	}
}
