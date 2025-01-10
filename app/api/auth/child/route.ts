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

  // Fetch child data from the parent's record
  const parent = await User.findById(user.userId).select("-password");
  if (!parent || !parent.child) {
    return NextResponse.json(
      { error: "Child profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Child profile fetched successfully",
    child: parent.child,
  });
}
