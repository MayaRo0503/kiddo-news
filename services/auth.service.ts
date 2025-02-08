import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/email";
import { nanoid } from "nanoid";
import type { IUserDocument } from "@/types";

// Define a type for the user data
interface UserData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export const login = async (email: string, password: string) => {
	// Ensure email is provided
	if (!email || typeof email !== "string") {
		throw new Error("Invalid email format");
	}

	// Fetch user from the database
	const user: IUserDocument | null = await User.findOne({ email });
	if (!user) throw new Error("User not found");

	// Validate password
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) throw new Error("Invalid password");

	const token = jwt.sign(
		{
			userId: user._id,
			isVerified: user.verified, // Include isVerified status in token payload
		},
		process.env.JWT_SECRET,
		{ expiresIn: "24h" },
	);

	// Return token and user data (excluding password)
	return { token, user: { ...user.toObject(), password: undefined } };
};

export const register = async (userData: UserData) => {
	// Validate mandatory fields
	const { email, password, firstName, lastName } = userData;
	if (!email || !password || !firstName || !lastName) {
		throw new Error("All fields are required");
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new Error("Invalid email format");
	}

	// Validate password strength
	const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
	if (!passwordRegex.test(password)) {
		throw new Error(
			"Password must be at least 8 characters long, include letters and numbers",
		);
	}

	// Check for duplicate email
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error("Email already registered");
	}

	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Generate a unique username for the child
	const childUsername = `${firstName.toLowerCase()}_${nanoid(5)}`;

	// Create and save the user
	const newUser = await User.create({
		...userData,
		password: hashedPassword,
		verified: false, // Default to false for verification
		child: {
			name: userData.firstName,
			username: childUsername,
		},
	});

	// Generate verification token
	const verificationToken = jwt.sign(
		{ userId: newUser._id }, // Use `newUser` after it has been created
		process.env.JWT_SECRET, // Your secret key
		{ expiresIn: "1d" }, // Token expires in 1 day
	);

	// Send verification email
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
	await sendVerificationEmail(email, verificationLink, childUsername);

	return { message: "Registration successful. Please verify your email." };
};
