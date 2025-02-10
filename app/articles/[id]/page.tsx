"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import { Textarea } from "app/components/ui/textarea";
import { Heart, Bookmark, MessageCircle, ArrowUp } from "lucide-react";
import { useAuth } from "app/contexts/AuthContext";

// Add styles for the page wrapper
const pageStyles = `
  .page-wrapper {
    height: 100vh;
    overflow-y: scroll;
    scrollbar-width: auto;
    scrollbar-color: #a855f7 #f3e8ff;
  }

  .page-wrapper::-webkit-scrollbar {
    width: 16px;
    background-color: #f3e8ff;
  }

  .page-wrapper::-webkit-scrollbar-thumb {
    background-color: #a855f7;
    border-radius: 20px;
    border: 4px solid #f3e8ff;
    min-height: 40px;
  }

  .page-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #9333ea;
  }

  .page-wrapper::-webkit-scrollbar-track {
    background-color: #f3e8ff;
    border-radius: 20px;
  }

  html {
    overflow: hidden;
    height: 100%;
  }

  body {
    height: 100%;
    overflow: hidden;
  }
`;

interface Comment {
  id: number;
  author: string;
  content: string;
  replies: Comment[];
}

interface Article {
  _id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
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
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/articles/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const data = await response.json();
        setArticle(data);

        // Check if the article is liked or saved
        const userResponse = await fetch("/api/user/article-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId: params.id }),
        });
        if (userResponse.ok) {
          const { isLiked, isSaved } = await userResponse.json();
          setIsLiked(isLiked);
          setIsSaved(isSaved);
        }
      } catch (err) {
        setError("Error fetching article");
        console.error(err);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id, isLoggedIn, router]);

  // Add styles to head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = pageStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setShowScrollButtons(target.scrollTop > 200);
    };

    const wrapper = document.querySelector(".page-wrapper");
    if (wrapper) {
      wrapper.addEventListener("scroll", handleScroll);
      return () => wrapper.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToSection = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToTop = () => {
    const wrapper = document.querySelector(".page-wrapper");
    if (wrapper) {
      wrapper.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && article) {
      const newCommentObj = {
        id: Date.now(),
        author: "You",
        content: newComment,
        replies: [],
      };
      setArticle({
        ...article,
        comments: [...article.comments, newCommentObj],
      });
      setNewComment("");
    }
  };

  const handleReply = (parentId: number, replyContent: string) => {
    if (article) {
      const updatedComments = article.comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: Date.now(),
                author: "You",
                content: replyContent,
                replies: [],
              },
            ],
          };
        }
        return comment;
      });
      setArticle({
        ...article,
        comments: updatedComments,
      });
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/articles/${article?._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ like: !isLiked }),
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
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/articles/${article?._id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ save: !isSaved }),
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

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!article) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="page-wrapper bg-gradient-to-b from-purple-100 to-blue-100">
      <div className="container mx-auto max-w-4xl p-4">
        <Card
          id="article-top"
          className="mb-8 bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
        >
          <CardHeader className="bg-gradient-to-r from-pink-300 to-yellow-300 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
              {article.title}
            </h1>
            <p className="text-gray-700">
              By {article.author} |{" "}
              {new Date(article.date).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 object-cover mb-6 rounded-xl shadow-md hover:shadow-lg transition-duration-300"
              />
            )}
            <p className="text-lg leading-relaxed text-gray-700">
              {article.content}
            </p>
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
              {article.comments.map((comment) => (
                <Card
                  key={comment.id}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => {
                        const reply = prompt("Write your reply:");
                        if (reply) handleReply(comment.id, reply);
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </CardFooter>
                  {comment.replies.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-purple-200 pl-4">
                      {comment.replies.map((reply) => (
                        <Card
                          key={reply.id}
                          className="bg-white rounded-lg p-3"
                        >
                          <CardHeader className="p-0">
                            <h4 className="font-semibold text-sm text-purple-600">
                              {reply.author}
                            </h4>
                          </CardHeader>
                          <CardContent className="py-1">
                            <p className="text-sm text-gray-600">
                              {reply.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          {showScrollButtons && (
            <Button
              onClick={scrollToTop}
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
        </div>
      </div>
    </div>
  );
}
