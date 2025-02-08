import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("=== Registration Request ===");
    console.log("Received registration data:", data);

    // Validate required fields
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      console.log("Missing required fields:", { data });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log("User already exists:", data.email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: hashedPassword,
      },
    });

    console.log("User created successfully:", user.id);
    return NextResponse.json(
      { message: "Registration successful", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
