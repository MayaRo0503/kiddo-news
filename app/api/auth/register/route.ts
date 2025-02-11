import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { nanoid } from "nanoid";
import { registrationSchema } from "@/schemas/registrationSchema";
import { string, ValidationError } from "yup";
import bcrypt from "bcrypt";

type RegisterRequestBody = {
  role: "admin" | "parent";
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  childName?: string;
  childBirthDate?: string;
  timeLimit?: number;
};

interface RegisterRequest extends Request {
  json: () => Promise<RegisterRequestBody>;
}

export async function POST(req: RegisterRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    try {
      await registrationSchema(body.role).validate(body, { abortEarly: false });
    } catch (error) {
      if (error instanceof ValidationError) {
        const validationErrors = error.inner.reduce((acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(
          {
            errors: validationErrors,
          },
          { status: 400 }
        );
      }
    }

    // Check for existing user/admin
    const existingUser = await (body.role === "admin"
      ? Admin.findOne({ email: body.email })
      : User.findOne({ email: body.email }));

    if (existingUser) {
      return NextResponse.json(
        {
          errors: {
            email: `${
              body.role === "admin" ? "Admin" : "User"
            } with this email already exists`,
          },
        },
        { status: 400 }
      );
    }

    if (body.role === "admin") {
      const newAdmin = new Admin({
        email: body.email,
        password: await bcrypt.hash(body.password, 10),
        firstName: body.firstName,
        lastName: body.lastName,
        role: "admin",
      });

      await newAdmin.save();

      return NextResponse.json({
        user: {
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          role: newAdmin.role,
          createdAt: newAdmin.createdAt,
        },
      });
    }
    // Create user
    const childUsername = `${body
      .childName!.toLowerCase()
      .replace(/\s+/g, "")}_${nanoid(5)}`;

    const newUser = new User({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      role: "parent",
      child: {
        name: body.childName,
        username: childUsername,
        birthDate: body.childBirthDate,
        savedArticles: [],
        likedArticles: [],
        timeLimit: body.timeLimit || 30,
        parentId: null,
        role: "child",
        access_code: string,
      },
    });

    // Set the parent ID reference
    if (body.role === "parent") {
      newUser.child.parentId = newUser._id;
    }
    await newUser.save();

    return NextResponse.json({
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        child: newUser.child,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
