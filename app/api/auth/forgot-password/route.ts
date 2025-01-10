import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email } = await req.json();

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1); // Add 1 hour
    user.resetPasswordExpires = oneHourFromNow; // Set the expiration date
    await user.save();

    // Mock sending the reset token via email
    console.log(`Reset token for ${email}: ${resetToken}`);

    return NextResponse.json({
      message: "Reset token generated. Please check your email.",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return NextResponse.json(
      { error: "Failed to generate reset token" },
      { status: 500 }
    );
  }
}
