import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password, firstName, lastName, childName, timeLimit } =
      await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      childName,
      timeLimit,
    });

    return NextResponse.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        childName: user.childName,
        timeLimit: user.timeLimit,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
