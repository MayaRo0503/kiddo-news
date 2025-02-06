"use client";

import { useState } from "react";
import type { Article } from "@/types/Article";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

interface ArticleListProps {
  articles: Article[];
  onArticleAction: (
    articleId: string,
    action: "approve" | "reject" | "gptCorrection",
    correctionNote?: string
  ) => void;
}

export default function ArticleList({
  articles,
  onArticleAction,
}: ArticleListProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGPTCorrection = (article: Article) => {
    setSelectedArticle(article);
    setIsDialogOpen(true);
  };

  const handleSendCorrection = () => {
    if (selectedArticle) {
      onArticleAction(selectedArticle._id, "gptCorrection", correctionNote);
      setIsDialogOpen(false);
      setCorrectionNote("");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: Article["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending_correction":
        return <Badge variant="outline">Pending Correction</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <div
          key={article._id}
          className="bg-white shadow-md rounded-lg p-6 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            {getStatusBadge(article.status)}
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>Author: {article.author}</span>
            <span>
              Published: {new Date(article.publishDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-600 mb-4 ltr">{article.content}</p>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Filtering Information:
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {article.keyPhrases.map((phrase, index) => (
                <Badge key={index} variant="secondary">
                  {phrase}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={getSentimentColor(article.sentiment)}
              >
                Sentiment: {article.sentiment}
              </Badge>
              <span className="text-sm">
                Relevance: {article.relevance.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onArticleAction(article._id, "approve")}
              variant="default"
              disabled={article.status === "approved"}
            >
              Approve
            </Button>
            <Button
              onClick={() => onArticleAction(article._id, "reject")}
              variant="destructive"
              disabled={article.status === "rejected"}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleGPTCorrection(article)}
              variant="outline"
              disabled={article.status === "pending_correction"}
            >
              Send for GPT Correction
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send for GPT Correction</DialogTitle>
            <DialogDescription>
              Please provide instructions for GPT correction.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder="Enter correction instructions here..."
            rows={4}
          />
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSendCorrection} variant="default">
              Send for Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
