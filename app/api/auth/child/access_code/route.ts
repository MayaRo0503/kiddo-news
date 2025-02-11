import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(req: Request) {
  await dbConnect();

  // Authenticate the user using the middleware
  const user = authenticateToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Ensure the user is a child
  if (user.role !== "child") {
    return NextResponse.json(
      { error: "Access restricted to children only" },
      { status: 403 }
    );
  }

  // Parse the request body to get the new access code
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { access_code } = body;
  if (!access_code) {
    return NextResponse.json(
      { error: "Access code is required" },
      { status: 400 }
    );
  }

  // Find the parent's record using the authenticated user's ID
  const parent = await User.findById(user.userId);
  console.log(parent?.userId);
  if (!parent || !parent.child) {
    return NextResponse.json(
      { error: "Child profile not found" },
      { status: 404 }
    );
  }

  // Update the child's access_code field
  parent.child.access_code = access_code;

  try {
    // Save the updated parent document (which includes the child subdocument)
    await parent.save();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update access code" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Access code updated successfully",
    child: parent.child,
  });
}
