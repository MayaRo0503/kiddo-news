import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { title, content, category } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps filter and adapt news articles for children. Ensure the content is age-appropriate, easy to understand, and educational.",
        },
        {
          role: "user",
          content: `Please review and adapt the following news article for children:

Title: ${title}

Content: ${content}`,
        },
      ],
    });

    const filteredContent = response.choices[0].message.content;

    if (!filteredContent) {
      throw new Error("Failed to generate filtered content");
    }

    const article = await prisma.article.create({
      data: {
        title,
        content: filteredContent,
        status: "PENDING",
        category: category || "Uncategorized", // Use the provided category or default to 'Uncategorized'
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error filtering article:", error);
    return NextResponse.json(
      { error: "Failed to filter article" },
      { status: 500 }
    );
  }
}
