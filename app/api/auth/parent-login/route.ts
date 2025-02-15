import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
	try {
		console.log("Parent login route hit");
		await dbConnect();

		const { email, password } = await req.json();

		// Find the user by email and ensure the role is "parent"
		const user = await User.findOne({ email });
		if (!user || user.role !== "parent") {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Validate the password asynchronously
		const isPasswordValid = await bcrypt.compare(
			password.trim(),
			user.password,
		);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Update the last login time
		user.lastLogin = new Date();
		await user.save();

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
				role: "parent",
				name: `${user.firstName} ${user.lastName}`, // Add parent name for frontend usage
			},
			process.env.JWT_SECRET || "fallbackSecret",
			{ expiresIn: "24h" },
		);

		return NextResponse.json({ message: "Login successful", token });
	} catch (error) {
		console.error("Parent login error:", error);
		return NextResponse.json({ error: "Login failed" }, { status: 500 });
	}
}
