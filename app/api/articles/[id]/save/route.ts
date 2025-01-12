import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { save } = await req.json();

    const user = authenticateToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await Article.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const parentUser = await User.findById(user.userId);
    if (!parentUser || !parentUser.child) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const childSavedArticles = parentUser.child.savedArticles;

    // Prevent duplicate actions
    const alreadySaved = childSavedArticles.includes(article._id.toString());

    if (save && !alreadySaved) {
      childSavedArticles.push(article._id);
      article.saves += 1;
    } else if (!save && alreadySaved) {
      parentUser.child.savedArticles = childSavedArticles.filter(
        (id: string) => id.toString() !== article._id.toString()
      );

      article.saves -= 1;
    }

    await parentUser.save();
    await article.save();

    return NextResponse.json({
      message: "Save updated successfully",
      saves: article.saves,
    });
  } catch (error) {
    console.error("Error updating saves:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
