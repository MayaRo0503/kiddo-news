import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { like } = await req.json(); // Expect true to add like, false to remove

    // Verify the token from the request headers.
    const user = await authenticateToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure only a child can update likes.
    if (user.role !== "child") {
      return NextResponse.json(
        { error: "Access restricted to children only" },
        { status: 403 }
      );
    }

    // Fetch the parent's document that holds the embedded child.
    const parent = await User.findById(user.userId);
    if (!parent || !parent.child) {
      return NextResponse.json(
        { error: "Child profile not found" },
        { status: 404 }
      );
    }

    // Find the article by its ID.
    const article = await RawArticle.findById((await params).id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Convert the article ID to string.
    const articleIdStr = article._id.toString();

    // Check if the article is already liked by filtering the actual ObjectId array.
    const alreadyLiked = parent.child.likedArticles.some(
      (id: any) => id.toString() === articleIdStr
    );

    if (like && !alreadyLiked) {
      // Add the article's ObjectId to the child's likedArticles and increment likes.
      parent.child.likedArticles.push(article._id);
      article.likes = (article.likes || 0) + 1;
    } else if (!like && alreadyLiked) {
      // Remove the article's ObjectId by filtering the existing array.
      parent.child.likedArticles = parent.child.likedArticles.filter(
        (id: any) => id.toString() !== articleIdStr
      );
      article.likes = Math.max((article.likes || 0) - 1, 0);
    }

    await parent.save();
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
