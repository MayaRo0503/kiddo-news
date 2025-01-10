import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: {
  json: () =>
    | PromiseLike<{
        email: any;
        password: any;
        firstName: any;
        lastName: any;
        childName: any;
        timeLimit: any;
      }>
    | {
        email: any;
        password: any;
        firstName: any;
        lastName: any;
        childName: any;
        timeLimit: any;
      };
}) {
  try {
    await dbConnect(); // Connect to the database

    const { email, password, firstName, lastName, childName, timeLimit } =
      await req.json();

    console.log("Register request received:", { email });

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("User already exists:", { email });
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create a new user. The pre-save hook will hash the password.
    const newUser = await User.create({
      email,
      password, // Pass the plain password; pre-save hook will hash it
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
        child: newUser.child,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
