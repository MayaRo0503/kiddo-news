"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

interface Article {
  _id: string;
  title: string;
  gptSummary: string;
  sentiment: string;
  ageRange: string;
}

export default function AdminReviewPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [adminComments, setAdminComments] = useState("");
  const [targetAgeRange, setTargetAgeRange] = useState("");

  useEffect(() => {
    fetchArticlesForReview();
  }, []);

  async function fetchArticlesForReview() {
    const response = await fetch("/api/articles/admin-review");
    const data = await response.json();
    if (data.success) {
      setArticles(data.articles);
      setCurrentArticle(data.articles[0] || null);
    }
  }

  async function submitReview(action: "approve" | "reject" | "refilter") {
    if (!currentArticle) return;

    const response = await fetch(
      `/api/articles/${currentArticle._id}/admin-review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminComments, targetAgeRange }),
      }
    );

    const data = await response.json();
    if (data.success) {
      // Remove the reviewed article and move to the next one
      setArticles(articles.filter((a) => a._id !== currentArticle._id));
      setCurrentArticle(articles[1] || null);
      setAdminComments("");
      setTargetAgeRange("");
    }
  }

  if (!currentArticle) {
    return <div>No articles pending review.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Review Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{currentArticle.title}</h2>
        <p className="mt-2">
          <strong>Summary:</strong> {currentArticle.gptSummary}
        </p>
        <p>
          <strong>Sentiment:</strong> {currentArticle.sentiment}
        </p>
        <p>
          <strong>Current Age Range:</strong> {currentArticle.ageRange}
        </p>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Target Age Range:</label>
        <Input
          value={targetAgeRange}
          onChange={(e) => setTargetAgeRange(e.target.value)}
          placeholder="e.g., 6-10"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Admin Comments:</label>
        <Textarea
          value={adminComments}
          onChange={(e) => setAdminComments(e.target.value)}
          placeholder="Enter your comments here..."
          rows={4}
        />
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => submitReview("approve")}>Approve</Button>
        <Button onClick={() => submitReview("reject")} variant="destructive">
          Reject
        </Button>
        <Button onClick={() => submitReview("refilter")} variant="secondary">
          Re-filter
        </Button>
      </div>
    </div>
  );
}
