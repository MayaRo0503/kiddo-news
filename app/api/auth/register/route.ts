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
        timeLimit: number;
      }>
    | {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        childName: string;
        timeLimit: number;
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

    // Generate a unique username for the child
    const childUsername = `${childName
      .toLowerCase()
      .replace(/\s+/g, "")}_${nanoid(5)}`;

    // Create a new user with the required fields
    const newUser = new User({
      email,
      password, // Pass the plain password; pre-save hook will hash it
      firstName,
      lastName,
      role: "parent",
      child: {
        name: childName,
        username: childUsername, // Set the unique username
        savedArticles: [],
        likedArticles: [],
        timeLimit: timeLimit || 0, // Default to 0 if not provided
        parentId: null, // Placeholder, will set below
      },
    });

    // Set parentId in the child's schema
    newUser.child.parentId = newUser._id; // Link child to parent
    await newUser.save(); // Save the user to the database

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
