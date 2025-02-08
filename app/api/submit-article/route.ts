import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { title, content, category } = await request.json();

  try {
    const article = await prisma.article.create({
      data: {
        title,
        content,
        category,
        status: "PENDING",
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error submitting article:", error);
    return NextResponse.json(
      { error: "Failed to submit article" },
      { status: 500 }
    );
  }
}
