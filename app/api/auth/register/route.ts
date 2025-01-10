import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password, firstName, lastName, childName, timeLimit } =
      await req.json();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the parent's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with parent and child details
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      child: {
        name: childName,
        savedArticles: [],
        likedArticles: [],
        timeLimit: timeLimit || 0, // Default to 0 if not provided
      },
    });

    return NextResponse.json({
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        child: newUser.child, // Return child details
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
