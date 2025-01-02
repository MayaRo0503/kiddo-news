import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/mongodb"; // Import dbConnect correctly
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // חיבור למסד הנתונים
    await dbConnect(); // מתבצע חיבור למסד הנתונים

    const { email, password, firstName, lastName, childName, timeLimit, role } =
      await req.json();

    // חסימת סיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      childName,
      timeLimit,
      role: role || "child", // אם לא נמסר, ברירת המחדל היא "child"
    });

    // החזרת פרטי המשתמש לאחר ההרשמה
    return NextResponse.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        childName: user.childName,
        timeLimit: user.timeLimit,
        role: user.role, // הוספת שדה role
      },
    });
  } catch (_error) {
    console.error(_error); // שגיאה במקרה של בעיית התחברות
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
