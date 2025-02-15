import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const { email, password } = await req.json();

		const existingAdmin = await Admin.findOne({ email });
		if (existingAdmin) {
			return NextResponse.json(
				{ error: "Admin with this email already exists" },
				{ status: 400 },
			);
		}

		const newAdmin = new Admin({ email, password });
		await newAdmin.save();

		return NextResponse.json({
			message: "Admin registered successfully",
			admin: { email: newAdmin.email, role: newAdmin.role },
		});
	} catch (error) {
		console.error("Error during admin registration:", error);
		return NextResponse.json({ error: "Registration failed" }, { status: 500 });
	}
}
