import { NextResponse } from "next/server";
import Article from "@/models/Article";
import dbConnect from "@/lib/mongodb";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { save } = await req.json();

    const article = await Article.findById(params.id);
    if (!article)
      return NextResponse.json({ error: "Article not found" }, { status: 404 });

    article.saves += save ? 1 : -1;
    await article.save();

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating saves:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
