import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { nanoid } from "nanoid";

export async function POST(req: {
	json: () =>
		| PromiseLike<{
				email: string;
				password: string;
				firstName: string;
				lastName: string;
				childName: string;
				childBirthDate: string;
				timeLimit: number;
		  }>
		| {
				email: string;
				password: string;
				firstName: string;
				lastName: string;
				childName: string;
				childBirthDate: string;
				timeLimit: number;
		  };
}) {
	try {
		await dbConnect();

		const {
			email,
			password,
			firstName,
			lastName,
			childName,
			childBirthDate,
			timeLimit,
		} = await req.json();

		console.log("Register request received:", { email });

		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			console.warn("User already exists:", { email });
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 },
			);
		}

		// Validate birth date
		const birthDate = new Date(childBirthDate);
		if (Number.isNaN(birthDate.getTime())) {
			return NextResponse.json(
				{ error: "Invalid birth date format" },
				{ status: 400 },
			);
		}

		// Calculate age
		const today = new Date();
		let calculatedAge = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			calculatedAge--;
		}

		// Validate age (optional: add minimum/maximum age restrictions)
		if (calculatedAge < 5 || calculatedAge > 17) {
			return NextResponse.json(
				{ error: "Child must be between 5 and 17 years old" },
				{ status: 400 },
			);
		}

		// Generate a unique username for the child
		const childUsername = `${childName
			.toLowerCase()
			.replace(/\s+/g, "")}_${nanoid(5)}`;

		// Create a new user with the required fields
		const newUser = new User({
			email,
			password,
			firstName,
			lastName,
			role: "parent",
			child: {
				name: childName,
				username: childUsername,
				birthDate: birthDate,
				savedArticles: [],
				likedArticles: [],
				timeLimit: timeLimit || 0,
				parentId: null,
			},
		});

		// Set parentId in the child's schema
		newUser.child.parentId = newUser._id;
		await newUser.save();

		return NextResponse.json({
			user: {
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				role: newUser.role,
				child: newUser.child,
				createdAt: newUser.createdAt,
			},
		});
	} catch (error) {
		console.error("Error during registration:", error);
		return NextResponse.json({ error: "Registration failed" }, { status: 500 });
	}
}
