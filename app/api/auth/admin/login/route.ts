import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const { email, password } = await req.json();

		const admin = await Admin.findOne({ email });

		if (!admin) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		const isPasswordValid = await bcrypt.compare(password, admin.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Email or password is incorrect" },
				{ status: 401 },
			);
		}

		const token = jwt.sign(
			{ adminId: admin._id, role: admin.role },
			process.env.JWT_SECRET || "fallbackSecret",
			{ expiresIn: "24h" },
		);

		return NextResponse.json({
			message: "Login successful",
			token,
			admin: { email: admin.email, role: admin.role },
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json({ error: "Login failed" }, { status: 500 });
	}
}
