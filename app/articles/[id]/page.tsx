"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Heart,
  Bookmark,
  MessageCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "app/contexts/AuthContext";
interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Article {
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
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const params = useParams();
  const { isChild } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const data = await response.json();
        setArticle(data);

        // Check if the article is liked or saved by the current user
        if (isChild) {
          const userResponse = await fetch("/api/user/article-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ articleId: params.id }),
          });
          if (userResponse.ok) {
            const { isLiked, isSaved } = await userResponse.json();
            setIsLiked(isLiked);
            setIsSaved(isSaved);
          }
        }
      } catch (err) {
        setError("Error fetching article");
        console.error(err);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id, isChild]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButtons(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!isChild) return; // Ensure user is logged in
    try {
      const response = await fetch(`/api/articles/${article?._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const { likes } = await response.json();
        setArticle((prev) => (prev ? { ...prev, likes } : null));
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleSave = async () => {
    if (!isChild) return; // Ensure user is logged in
    try {
      const response = await fetch(`/api/articles/${article?._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const { saves } = await response.json();
        setArticle((prev) => (prev ? { ...prev, saves } : null));
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error("Error updating save:", error);
    }
  };

  const handleAddComment = async () => {
    if (!isChild || !newComment.trim() || !article) return;
    try {
      const response = await fetch(`/api/articles/${article._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setArticle({
          ...article,
          comments: [...article.comments, newCommentData],
        });
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const scrollToSection = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!article) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-purple-100 to-blue-100 min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8 bg-white rounded-3xl shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-300 to-yellow-300 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
              {article.title}
            </h1>
            <p className="text-gray-700">
              By {article.author} |{" "}
              {new Date(article.publishDate).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6 bg-yellow-100 p-4 rounded-xl">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">
                Summary
              </h2>
              <p className="text-lg text-gray-700">{article.gptSummary}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">
                Key Points
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {article.gptAnalysis.summarySentences.map((sentence, index) => (
                  <li key={index} className="text-lg text-gray-700">
                    {sentence}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 bg-gray-50">
            <Button
              variant="outline"
              className={`flex items-center bg-white hover:bg-pink-50 transition-colors duration-200 ${
                isLiked ? "text-pink-500" : "text-gray-500"
              }`}
              onClick={handleLike}
            >
              <Heart className="mr-2 h-5 w-5" />
              <span className="text-gray-700">{article.likes} Likes</span>
            </Button>
            <Button
              variant="outline"
              className={`flex items-center bg-white hover:bg-yellow-50 transition-colors duration-200 ${
                isSaved ? "text-yellow-500" : "text-gray-500"
              }`}
              onClick={handleSave}
            >
              <Bookmark className="mr-2 h-5 w-5" />
              <span className="text-gray-700">{article.saves} Saves</span>
            </Button>
          </CardFooter>
        </Card>

        <Card
          id="comments-section"
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8"
        >
          <CardHeader className="bg-gradient-to-r from-blue-300 to-green-300 p-6">
            <h2 className="text-3xl font-bold text-purple-800">Comments</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <Textarea
                placeholder="What do you think about this article? Share your thoughts!"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-4 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200 text-lg"
              />
              <Button
                onClick={handleAddComment}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 text-lg"
              >
                Post Comment
              </Button>
            </div>
            <div className="space-y-4">
              {article.comments && article.comments.length > 0 ? (
                article.comments.map((comment) => (
                  <Card
                    key={comment._id}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <CardHeader className="p-0">
                      <h3 className="font-bold text-lg text-purple-700">
                        {comment.author}
                      </h3>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-gray-700">{comment.content}</p>
                    </CardContent>
                    <CardFooter className="p-0">
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          {showScrollButtons && (
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg p-3 transition-all duration-200 hover:scale-110"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          )}
          <Button
            onClick={() => scrollToSection("comments-section")}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg p-3 transition-all duration-200 hover:scale-110"
            aria-label="Go to comments"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button
            onClick={scrollToBottom}
            className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg p-3 transition-all duration-200 hover:scale-110"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
