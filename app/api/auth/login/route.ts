import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: { json: () => Promise<LoginRequestBody> }) {
  try {
    console.log("Login route hit");
    await dbConnect(); // Connect to the database

    const { email, password } = await req.json();
    console.log("Email and Password received:", { email });

    // Find the user by email
    const user = await User.findOne({ email });
    console.log("User retrieved from database:", user);

    if (!user) {
      console.warn("User not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Validate the user's password
    const trimmedPassword = password.trim(); // Trim spaces to avoid encoding issues
    const isPasswordValid = bcrypt.compareSync(trimmedPassword, user.password);
    console.log("Password Validation During Login:", {
      plainPassword: trimmedPassword,
      storedHash: user.password,
      isValid: isPasswordValid,
    });

    if (!isPasswordValid) {
      console.warn("Invalid password");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Password validated successfully for:", email);

    // Check if the user is a child and if they are approved by the parent
    if (user.role === "child" && !user.child.approvedByParent) {
      console.warn("Child access not approved by parent");
      return NextResponse.json(
        { error: "Access not approved by parent" },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        approved: user.child?.approvedByParent || null, // Include approval status if the user is a child
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        child: user.child,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
