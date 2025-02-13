import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ childId: string }> },
) {
	try {
		console.log("Approve child route hit");
		await dbConnect();
		const { childId } = await params;
		const { approved } = await req.json(); // Expecting { approved: true/false }
		const parent = await User.findOne({ "child._id": childId });

		if (!parent) {
			return NextResponse.json({ error: "Child not found" }, { status: 404 });
		}

		const child = parent.child;
		if (!child || child._id.toString() !== childId) {
			return NextResponse.json({ error: "Invalid child ID" }, { status: 400 });
		}

		// Update the approval status
		child.approvedByParent = approved;
		await parent.save();

		return NextResponse.json({
			message: `Child access ${approved ? "approved" : "revoked"}`,
		});
	} catch (error) {
		console.error("Error approving child:", error);
		return NextResponse.json(
			{ error: "Failed to update child access" },
			{ status: 500 },
		);
	}
}
