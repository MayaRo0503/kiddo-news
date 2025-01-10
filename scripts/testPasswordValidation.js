import bcrypt from "bcrypt";

// Replace with a hashed password from your database
const hashedPassword =
  "$2a$10$syDvYLwHehK.z6kbRGsvd.vNQ5P8Ri4Lh4EOGQthGvSaanwSN5pbi";

// Replace with the password you're testing
const testPassword = "password123";

bcrypt.compare(testPassword, hashedPassword).then((isValid) => {
  console.log("Password Validation Result:", isValid);
});
