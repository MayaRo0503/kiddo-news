import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Activity, Article } from "@prisma/client";

export async function GET() {
  try {
    const childProfiles = await prisma.childProfile.findMany();
    const stats: { [key: string]: any } = {};

    for (const child of childProfiles) {
      const [likes, dislikes, comments, savedArticles, readActivities] =
        await Promise.all([
          prisma.like.count({ where: { childId: child.id } }),
          prisma.dislike.count({ where: { childId: child.id } }),
          prisma.comment.count({ where: { childId: child.id } }),
          prisma.savedArticle.count({ where: { childId: child.id } }),
          prisma.activity.findMany({
            where: { childId: child.id, action: "READ_ARTICLE" },
            include: { article: true },
          }),
        ]);

      const categoriesViewed = readActivities.reduce(
        (
          acc: { [key: string]: number },
          activity: Activity & { article: Article | null }
        ) => {
          if (activity.article && activity.article.category) {
            acc[activity.article.category] =
              (acc[activity.article.category] || 0) + 1;
          }
          return acc;
        },
        {}
      );

      stats[child.id] = {
        totalArticlesRead: readActivities.length,
        totalLikes: likes,
        totalDislikes: dislikes,
        totalComments: comments,
        totalSaved: savedArticles,
        categoriesViewed,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching child stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch child stats" },
      { status: 500 }
    );
  }
}
