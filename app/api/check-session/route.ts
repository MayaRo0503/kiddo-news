import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ session: null });
    }

    // If we have a session, get the user details
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      select: {
        id: true,
        name: true,
        email: true,
        childProfiles: {
          select: {
            id: true,
            name: true,
            username: true,
            timeLimit: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ session: null });
    }

    // Return the session data with user details
    return NextResponse.json({
      session: {
        user: {
          ...user,
          // Don't expose sensitive data
          password: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  try {
    const session = await getServerSession(authOptions);
    return new Response(null, {
      status: session ? 200 : 401,
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
