import { compare } from "bcrypt";
import bcrypt from "bcrypt";

const hash = "$2b$10$4PNb2k.vOEpvOp2piYYuCutY4SmYMjUI1LqWvyrxIygmVvSBz2c.y"; // Your hash from the database
const password = "password123"; // The password you used for registration

compare(password, hash, (err, result) => {
  if (err) {
    console.error("Error comparing password:", err);
  } else if (result) {
    console.log("Password matches the hash!");
  } else {
    console.log("Password does NOT match the hash.");
  }
});

const testPassword = "password123";

bcrypt.hash(testPassword, 10).then((hashedPassword) => {
  console.log("Generated Hash:", hashedPassword);

  bcrypt.compare(testPassword, hashedPassword).then((isMatch) => {
    console.log("Password Match:", isMatch); // Should print "Password Match: true"
  });
});
