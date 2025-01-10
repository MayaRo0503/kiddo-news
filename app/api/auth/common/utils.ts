import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";

export async function connectDatabase() {
  return dbConnect();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function validatePassword(
  inputPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(inputPassword, hashedPassword);
}

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}
