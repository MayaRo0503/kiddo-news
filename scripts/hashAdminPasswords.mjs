import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the Admin model
const Admin = (await import(join(__dirname, "..", "models", "Admin.js")))
  .default;

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function hashAdminPasswords() {
  await dbConnect();

  try {
    const admins = await Admin.find({});

    for (const admin of admins) {
      if (!admin.password.startsWith("$2b$")) {
        // Check if password is not already hashed
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        admin.password = hashedPassword;
        await admin.save();
        console.log(`Updated password for admin: ${admin.email}`);
      } else {
        console.log(`Password for admin ${admin.email} is already hashed.`);
      }
    }

    console.log("Finished updating admin passwords");
  } catch (error) {
    console.error("Error updating admin passwords:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

hashAdminPasswords().catch(console.error);
