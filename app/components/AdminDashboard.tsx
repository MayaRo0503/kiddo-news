"use client";

import { useState, useEffect, useRef } from "react";
import type { Article } from "@/types/Article";
import ArticleList from "../components/ArticleList";
import { SideScroller } from "../components/SideScroller";
import { toast } from "../components/ui/use-toast";

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const articleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/articles");
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError("Error fetching articles. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const handleArticleAction = async (
    articleId: string,
    action: "approve" | "reject" | "gptCorrection"
  ) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/admin-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update article");
      }

      const { newStatus } = await response.json();

      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === articleId
            ? { ...article, status: newStatus }
            : article
        )
      );

      toast({
        title: "Article Updated",
        description: `Article has been ${action}ed. New status: ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating article:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScroll = (percentage: number) => {
    if (articleContainerRef.current) {
      const scrollHeight =
        articleContainerRef.current.scrollHeight -
        articleContainerRef.current.clientHeight;
      articleContainerRef.current.scrollTop = (scrollHeight * percentage) / 100;
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div
        ref={articleContainerRef}
        className="h-[calc(100vh-8rem)] overflow-y-auto pr-16"
      >
        <ArticleList
          articles={articles}
          onArticleAction={handleArticleAction}
        />
      </div>
      <SideScroller
        onScroll={handleScroll}
        containerRef={articleContainerRef}
      />
    </div>
  );
}
