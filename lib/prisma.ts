import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test the database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Run the test when the server starts
testConnection();

export default prisma;
