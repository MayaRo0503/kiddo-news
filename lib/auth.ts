import { headers } from "next/headers";
import jwt from "jsonwebtoken";
export async function authenticateToken() {
  const headersList = await headers(); // Get headers directly
  const token = headersList.get("Authorization")?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch {
    return null;
  }
}
