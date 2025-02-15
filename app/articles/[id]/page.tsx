"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "app/contexts/AuthContext";
import { Spinner } from "@/app/components/Spinner";
import { Article } from "./components/article";
import { TimeUpWrapper } from "@/app/components/TimeUpWrapper";

interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ArticleType {
  _id: string;
  title: string;
  author: string;
  publishDate: string;
  gptAnalysis: {
    summarySentences: string[];
  };
  gptSummary: string;
  likes: number;
  saves: number;
  comments: Comment[];
}

export default function ArticlePage() {
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isChild, isAdmin, token } = useAuth(); // token is added from context

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!token) return;
        const response = await fetch(`/api/articles/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const { isSaved, isLiked, ...data } = await response.json();
        setIsLiked(isLiked);
        setIsSaved(isSaved);
        setArticle(data);
      } catch (err) {
        setError("Error fetching article");
        console.error(err);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id, token]);

  // Handle Like action
  const handleLike = async () => {
    if (!isChild && !isAdmin) return;
    try {
      const response = await fetch(`/api/articles/${article?._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ like: !isLiked }),
      });
      if (response.ok) {
        const { likes } = await response.json();
        setArticle((prev) => (prev ? { ...prev, likes } : null));
        setIsLiked(!isLiked);
      } else {
        console.error("Unauthorized or error updating like");
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Handle Save action
  const handleSave = async () => {
    if (!isChild && !isAdmin) return;
    try {
      const response = await fetch(`/api/articles/${article?._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ save: !isSaved }),
      });
      if (response.ok) {
        const { saves } = await response.json();
        setArticle((prev) => (prev ? { ...prev, saves } : null));
        setIsSaved(!isSaved);
      } else {
        console.error("Unauthorized or error updating save");
      }
    } catch (error) {
      console.error("Error updating save:", error);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.persist();
    const formData = new FormData(e.currentTarget);
    if (
      (!isChild && !isAdmin) ||
      !(formData.get("newComment") as string)?.trim() ||
      !article
    )
      return;
    try {
      const response = await fetch(`/api/articles/${article._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ content: formData.get("newComment") }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setArticle({
          ...article,
          comments: [...(article.comments || []), newCommentData],
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!article) {
    return <Spinner />;
  }

  function renderArticle(article: ArticleType) {
    return (
      <Article
        article={article}
        isSaved={isSaved}
        isLiked={isLiked}
        handleAddComment={handleAddComment}
        handleLike={handleLike}
        handleSave={handleSave}
      />
    );
  }

  return isChild ? (
    <TimeUpWrapper>{renderArticle(article)}</TimeUpWrapper>
  ) : (
    renderArticle(article)
  );
}
