// scripts/generateAdminToken.js

// 1. Use ES module imports
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// 2. Load .env.local (adjust the path if needed)
dotenv.config({ path: ".env.local" });

// 3. Pull JWT_SECRET from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set in .env.local");
  process.exit(1);
}

// 4. Create and sign a token
const adminId = "6784f2c37b3e8190e3c4f7b9"; // Example admin ID
const token = jwt.sign({ adminId, role: "admin" }, JWT_SECRET, {
  expiresIn: "1y", // e.g., valid for 1 year
});

// 5. Print the new token
console.log("New Admin Token:");
console.log(token);
