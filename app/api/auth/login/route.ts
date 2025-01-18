import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import type { NextRequest } from "next/server";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("Login route hit");
    await dbConnect();

    const body: LoginRequestBody = await req.json();
    const { email, password } = body;
    console.log("Email and Password received:", { email });

    const user = await User.findOne({ email });
    console.log("User retrieved from database:", user);

    if (!user) {
      console.warn("User not found");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const trimmedPassword = password.trim();
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

    if (user.role === "child" && !user.child?.approvedByParent) {
      console.warn("Child access not approved by parent");
      return NextResponse.json(
        { error: "Access not approved by parent" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        approved: user.child?.approvedByParent || null,
        isParent: user.role === "parent",
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
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
