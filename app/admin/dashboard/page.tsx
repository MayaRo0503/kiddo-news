"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PendingArticle {
  id: string;
  title: string;
  content: string;
}

export default function AdminDashboard() {
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);

  useEffect(() => {
    const fetchPendingArticles = async () => {
      try {
        const response = await fetch("/api/admin/pending-articles");
        const articles = await response.json();
        setPendingArticles(articles);
      } catch (error) {
        console.error("Error fetching pending articles:", error);
      }
    };

    fetchPendingArticles();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/approve-article/${id}`, {
        method: "POST",
      });
      if (response.ok) {
        setPendingArticles(
          pendingArticles.filter((article) => article.id !== id)
        );
      }
    } catch (error) {
      console.error("Error approving article:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reject-article/${id}`, {
        method: "POST",
      });
      if (response.ok) {
        setPendingArticles(
          pendingArticles.filter((article) => article.id !== id)
        );
      }
    } catch (error) {
      console.error("Error rejecting article:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-4">
        {pendingArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{article.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button onClick={() => handleApprove(article.id)}>Approve</Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(article.id)}
              >
                Reject
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
