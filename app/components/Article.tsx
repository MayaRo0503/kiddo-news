"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare, Bookmark } from "lucide-react";

interface ArticleProps {
  id: string;
  title: string;
  content: string;
  likes: number;
  dislikes: number;
  comments: { id: string; content: string; author: string }[];
  initialLikeStatus: "liked" | "disliked" | null;
  initialSaveStatus: boolean;
}

export function Article({
  id,
  title,
  content,
  likes: initialLikes,
  dislikes: initialDislikes,
  comments,
  initialLikeStatus,
  initialSaveStatus,
}: ArticleProps) {
  const [likeStatus, setLikeStatus] = useState<"liked" | "disliked" | null>(
    initialLikeStatus
  );
  const [isSaved, setIsSaved] = useState(initialSaveStatus);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const handleLike = async () => {
    if (likeStatus === "liked") return; // Already liked, do nothing

    try {
      const response = await fetch(`/api/articles/${id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        setLikeStatus("liked");
        setLikes((prev) => prev + 1);
        if (likeStatus === "disliked") {
          setDislikes((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };

  const handleDislike = async () => {
    if (likeStatus === "disliked") return; // Already disliked, do nothing

    try {
      const response = await fetch(`/api/articles/${id}/dislike`, {
        method: "POST",
      });
      if (response.ok) {
        setLikeStatus("disliked");
        setDislikes((prev) => prev + 1);
        if (likeStatus === "liked") {
          setLikes((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Error disliking article:", error);
    }
  };

  const handleSave = async () => {
    if (isSaved) return; // Already saved, do nothing

    try {
      const response = await fetch(`/api/articles/${id}/save`, {
        method: "POST",
      });
      if (response.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const handleComment = async () => {
    try {
      const response = await fetch(`/api/articles/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        setNewComment("");
        // Ideally, we would update the comments list here
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
        <div className="mt-4 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-secondary p-2 rounded">
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-muted-foreground">
                - {comment.author}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleComment} className="mt-2">
            Post Comment
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            disabled={likeStatus === "liked"}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-2 ${
                likeStatus === "liked" ? "text-green-500" : ""
              }`}
            />
            {likes}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDislike}
            disabled={likeStatus === "disliked"}
          >
            <ThumbsDown
              className={`h-4 w-4 mr-2 ${
                likeStatus === "disliked" ? "text-red-500" : ""
              }`}
            />
            {dislikes}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaved}
        >
          <Bookmark
            className={`h-4 w-4 mr-2 ${isSaved ? "text-blue-500" : ""}`}
          />
          {isSaved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
