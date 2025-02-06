import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const { action } = await req.json();

    const article = await RawArticle.findById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let newStatus:
      | "pending"
      | "pre_filtered"
      | "gpt_filtered"
      | "processed"
      | "failed";

    switch (action) {
      case "approve":
        newStatus = "processed";
        break;
      case "reject":
        newStatus = "failed";
        break;
      case "gptCorrection":
        newStatus = "gpt_filtered";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    article.status = newStatus;
    await article.save();

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
