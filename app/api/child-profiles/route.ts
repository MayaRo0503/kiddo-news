import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        childProfiles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.childProfiles);
  } catch (error) {
    console.error("Error fetching child profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch child profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.username) {
      return NextResponse.json(
        { error: "Name and username are required" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingProfile = await prisma.childProfile.findUnique({
      where: { username: data.username },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const childProfile = await prisma.childProfile.create({
      data: {
        name: data.name,
        username: data.username,
        timeLimit: data.timeLimit || 120, // Default to 120 minutes if not specified
        parentId: user.id,
      },
    });

    return NextResponse.json(childProfile);
  } catch (error) {
    console.error("Error creating child profile:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create child profile",
      },
      { status: 500 }
    );
  }
}
