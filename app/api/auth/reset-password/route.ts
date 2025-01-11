import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { token, newPassword } = await req.json();

    // Find the user by reset token and check token expiry
    const now = new Date();
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: now },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null; // Clear the reset token
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
