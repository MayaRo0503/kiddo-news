import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    adminId: "6784f2c37b3e8190e3c4f7b9your_admin_id", // Replace this with the `_id` of your admin user in the database
    role: "admin",
  },
  "my_super_secret_key_123!", // Use the same value as `JWT_SECRET` in `.env.local`
  { expiresIn: "1d" } // Token expires in 1 day
);

console.log("Generated Admin Token:", token);
