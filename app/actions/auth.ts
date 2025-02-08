"use server";

import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function register(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const mobileNumber = formData.get("mobileNumber") as string | null;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        mobileNumber: mobileNumber || undefined, // Use undefined if mobileNumber is null
      },
    });

    // Create a session
    const sessionToken = crypto.randomUUID();
    cookies().set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register user" };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Create a session
    const sessionToken = crypto.randomUUID();
    cookies().set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to login" };
  }
}

export async function logout() {
  cookies().delete("session");
  return { success: true };
}
