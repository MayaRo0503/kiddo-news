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
    const { like } = await req.json();

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

    const childLikedArticles = parentUser.child.likedArticles;

    // Prevent duplicate actions
    const alreadyLiked = childLikedArticles.includes(article._id.toString());

    if (like && !alreadyLiked) {
      childLikedArticles.push(article._id);
      article.likes += 1;
    } else if (!like && alreadyLiked) {
      parentUser.child.likedArticles = childLikedArticles.filter(
        (id: string) => id.toString() !== article._id.toString()
      );

      article.likes -= 1;
    }

    await parentUser.save();
    await article.save();

    return NextResponse.json({
      message: "Like updated successfully",
      likes: article.likes,
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
