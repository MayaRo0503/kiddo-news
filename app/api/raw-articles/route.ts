import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

export async function GET(req: Request) {
  try {
    const user = await authenticateToken(req); // Await required here
    if (!user || user.role !== "admin") {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const latestArticles = await RawArticle.find()
      .sort({ crawledAt: -1 })
      .limit(10)
      .select("title source originalUrl crawledAt");

    return NextResponse.json(latestArticles);
  } catch (error) {
    console.error("Error fetching raw articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
