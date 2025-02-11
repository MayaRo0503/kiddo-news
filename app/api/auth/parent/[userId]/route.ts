import { authenticateToken } from "@/app/api/auth/common/middleware";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();

    // Resolve the `params` from the Promise
    const resolvedParams = await context.params;

    // Authenticate the user using the token
    const user = authenticateToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Ensure the user has the correct role to access this route
    if (user.role !== "parent") {
      return NextResponse.json(
        { error: "Access restricted to parents only" },
        { status: 403 }
      );
    }

    // Ensure the authenticated user matches the requested user ID
    if (user.userId !== resolvedParams.userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch the parent user from the database
    const parent = await User.findById(resolvedParams.userId).select(
      "-password"
    );
    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Return the parent profile data
    return NextResponse.json({
      message: "Parent profile fetched successfully",
      parent: {
        email: parent.email,
        firstName: parent.firstName,
        lastName: parent.lastName,
        role: parent.role,
        child: parent.child,
      },
    });
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the parent profile" },
      { status: 500 }
    );
  }
}
