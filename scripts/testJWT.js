import { sign } from "jsonwebtoken";

const adminToken = sign(
  {
    adminId: "6784f2c37b3e8190e3c4f7b9", // Match the `_id` from your database
    role: "admin",
  },
  "my_super_secret_key_123!", // Match JWT_SECRET in .env.local
  { expiresIn: "1d" } // Token valid for 1 day
);

console.log("Generated Admin Token:", adminToken);
