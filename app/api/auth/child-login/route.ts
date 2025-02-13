import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
	try {
		console.log("Child login route hit");
		await dbConnect();

		const { username, password } = await req.json();

		const parent = await User.findOne({ "child.username": username });
		if (!parent) {
			return NextResponse.json({ error: "Child not found" }, { status: 404 });
		}

		const child = parent.child;
		if (!child || child.username !== username) {
			return NextResponse.json({ error: "Invalid username" }, { status: 401 });
		}

		// If the child has an access_code, use it for authentication
		if (child.access_code) {
			console.log(child.access_code, password.trim());
			if (child.access_code !== password.trim()) {
				return NextResponse.json(
					{ error: "Invalid access code" },
					{ status: 401 },
				);
			}
		} else {
			// Fallback to parent's password if no access_code is set
			const isPasswordValid = bcrypt.compareSync(
				password.trim(),
				parent.password,
			);
			if (!isPasswordValid) {
				return NextResponse.json(
					{ error: "Invalid password" },
					{ status: 401 },
				);
			}
		}

		if (!child.approvedByParent) {
			return NextResponse.json(
				{ error: "Access not approved by parent" },
				{ status: 403 },
			);
		}

		// Reset remaining time if it’s a new day
		const currentDate = new Date().toISOString().split("T")[0];
		if (child.lastLoginDate !== currentDate) {
			child.lastLoginDate = currentDate;
			child.remainingTime = child.timeLimit; // Reset to full daily limit
		}

		if (child.remainingTime <= 0) {
			return NextResponse.json(
				{ error: "Time limit exhausted for the day" },
				{ status: 403 },
			);
		}

		// Update session start time and decrement remaining time
		child.sessionStartTime = new Date();
		await parent.save();

		const token = jwt.sign(
			{ userId: parent._id, role: "child", username: child.username },
			process.env.JWT_SECRET || "fallbackSecret",
			{ expiresIn: "24h" },
		);

		return NextResponse.json({
			message: "Login successful",
			token,
			child: {
				name: child.name,
				username: child.username,
				timeLimit: child.timeLimit,
				remainingTime: child.remainingTime,
			},
		});
	} catch (error) {
		console.error("Child login error:", error);
		return NextResponse.json({ error: "Login failed" }, { status: 500 });
	}
}
