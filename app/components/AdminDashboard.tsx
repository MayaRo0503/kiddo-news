"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Article } from "@/types/Article";
import ArticleList from "../components/ArticleList";
import { SideScroller } from "../components/SideScroller";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const articleContainerRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchArticles = useCallback(async () => {
    try {
      const response = await fetch("/api/articles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      const data = await response.json();
      setArticles(data);
    } catch {
      setError("Error fetching articles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticleAction = async (
    articleId: string,
    action: "approve" | "reject" | "gptCorrection",
    correctionNote?: string,
    targetAgeRange?: number
  ) => {
    try {
      const endpoint =
        action === "gptCorrection" ? "gpt-filter" : "admin-review";
      const response = await fetch(`/api/articles/${articleId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, correctionNote, targetAgeRange }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update article");
      }

      const toastActionMap = {
        gptCorrection: "sent for review",
        approve: "approved",
        reject: "rejected",
      } satisfies Record<typeof action, string>;

      toast({
        title: "Article Updated",
        description: `Article has been ${toastActionMap[action]}`,
      });

      await fetchArticles().catch();

      const statusMap = {
        approve: "approved",
        reject: "rejected",
        gptCorrection: "pending",
      } satisfies Record<typeof action, "pending" | "approved" | "rejected">;

      setArticles((prev) => {
        return prev.map((article) => {
          if (article.id === articleId) {
            return {
              ...article,
              status: statusMap[action],
            };
          }
          return article;
        });
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
