import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

async function testLogin() {
  await dbConnect();

  const email = "test@example.com"; // Replace with your test email
  const password = "password123"; // Replace with your test password

  // Find the user in the database
  const user = await User.findOne({ email });
  if (!user) {
    console.error("User not found");
    return;
  }

  console.log("User found:", user);

  // Validate the user's password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log("Password validation result:", isPasswordValid);

  if (!isPasswordValid) {
    console.error("Invalid password");
    return;
  }

  // Generate a token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallbackSecret",
    { expiresIn: "24h" }
  );
  console.log("Generated JWT token:", token);
}

testLogin();
