import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();

    const { token } = params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Ensure token is not expired
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      message: "Email verification successful. You can now log in.",
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.json(
      { error: "Email verification failed" },
      { status: 500 }
    );
  }
}
