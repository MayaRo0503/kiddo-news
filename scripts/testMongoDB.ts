import dotenv from "dotenv";
import dbConnect from "@/lib/mongodb";

// Load environment variables
dotenv.config();

(async () => {
  try {
    const connection = await dbConnect();
    console.log("Connection successful:", connection.connection.name);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", (error as Error).message);
  }
})();
