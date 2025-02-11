import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import User from "@/models/User";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { content } = await request.json();

    const user = authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentUser = await User.findById(user.userId);
    if (!parentUser || !parentUser.child) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const newComment = {
      content,
      author: parentUser.child.username,
      authorId: parentUser.child._id,
      createdAt: new Date().toISOString(),
    };

    const updatedArticle = await RawArticle.findByIdAndUpdate(
      params.id,
      { $push: { comments: newComment } },
      { new: true, select: "comments" }
    );

    if (!updatedArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const addedComment =
      updatedArticle.comments[updatedArticle.comments.length - 1];

    return NextResponse.json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
