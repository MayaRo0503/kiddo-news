import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function authenticateToken(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		console.log("No token provided");
		return null;
	}

	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			console.error("JWT_SECRET is not set in environment variables");
			return null;
		}

		console.log(
			"JWT_SECRET (first 20 characters):",
			`${secret.substring(0, 20)}...`,
		);
		console.log("Token (first 20 characters):", `${token.substring(0, 20)}...`);

		const decoded = jwt.verify(token, secret);
		console.log("Token verified successfully");
		return decoded;
	} catch (error: unknown) {
		if (error instanceof jwt.JsonWebTokenError) {
			console.error("JWT verification error:", error.message);
		} else if (error instanceof Error) {
			console.error(
				"Unexpected error during token verification:",
				error.message,
			);
		} else {
			console.error(
				"Unexpected error during token verification:",
				String(error),
			);
		}
		return null;
	}
}
