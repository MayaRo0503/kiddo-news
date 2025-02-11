import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { save } = await req.json();

    const user = await authenticateToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await RawArticle.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let parentUser;
    if (typeof user !== "string" && user.role === "child") {
      parentUser = await User.findOne({ "child._id": user._id });
    } else {
      if (typeof user !== "string" && user._id) {
        parentUser = await User.findById(user._id);
      } else {
        return NextResponse.json({ error: "Invalid user" }, { status: 400 });
      }
    }

    if (!parentUser || !parentUser.child) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const childSavedArticles = parentUser.child.savedArticles;

    // Prevent duplicate actions
    const alreadySaved = childSavedArticles.includes(article._id.toString());

    if (save && !alreadySaved) {
      childSavedArticles.push(article._id);
      article.saves = (article.saves || 0) + 1;
    } else if (!save && alreadySaved) {
      parentUser.child.savedArticles = childSavedArticles.filter(
        (id: string) => id.toString() !== article._id.toString()
      );

      article.saves = Math.max((article.saves || 0) - 1, 0);
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
