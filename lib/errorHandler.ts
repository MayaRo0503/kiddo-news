import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function handleError(error: unknown) {
  console.error("Error:", error);

  let message = "An unexpected error occurred";
  let statusCode = 500;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        message = "A unique constraint failed. This record already exists.";
        statusCode = 400;
        break;
      // Add more Prisma error codes as needed
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json({ error: message }, { status: statusCode });
}
