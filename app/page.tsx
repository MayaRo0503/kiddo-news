"use client";

import { useEffect, useState } from "react";
import ArticleCarouselWrapper from "./components/ArticleCarouselWrapper";
import { Article } from "types/Article";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) throw new Error("Failed to fetch articles");
        const data: (Omit<Article, "id"> & { _id: string })[] =
          await res.json();

        setArticles(
          data.map((article) => ({
            ...article,
            id: article._id,
            date: new Date(article.date),
          }))
        );
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!articles.length) return <div>No articles available</div>;

  return (
    <div className="p-4">
      {/* Removed any potential repeated header */}
      <h1 className="text-3xl font-bold mb-4">Welcome to Kiddo News</h1>
      <ArticleCarouselWrapper articles={articles} />
    </div>
  );
}
