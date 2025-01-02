import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    return { token, user: { ...user.toObject(), password: undefined } };
  }

  static async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return User.create({ ...userData, password: hashedPassword });
  }
}
