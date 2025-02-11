import bcrypt from "bcrypt";

const testPassword = "password123";

async function testHashingAndValidation() {
  // Step 1: Hash the password
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  console.log("Generated Hash:", hashedPassword);

  // Step 2: Validate the password
  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  console.log("Validation Result:", isValid); // Should be true
}

testHashingAndValidation();
