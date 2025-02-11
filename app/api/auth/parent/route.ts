import { authenticateToken } from "@/app/api/auth/common/middleware";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();

  // Authenticate the user using the middleware
  const user = authenticateToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Ensure the user is a parent
  if (user.role !== "parent") {
    return NextResponse.json(
      { error: "Access restricted to parents only" },
      { status: 403 }
    );
  }

  // Fetch parent data from the database
  const parent = await User.findById(user.userId).select("-password");
  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Parent profile fetched successfully",
    parent: {
      email: parent.email,
      firstName: parent.firstName,
      lastName: parent.lastName,
      role: parent.role,
      child: parent.child, // Include child details
    },
  });
}
