"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export function CommentSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/articles/${articleId}/comments`);
        if (!res.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data: Comment[] = await res.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }

    fetchComments();
  }, [articleId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) {
        throw new Error("Failed to post comment");
      }
      const comment: Comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Comments</h3>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 border rounded mb-2"
      ></textarea>
      <button
        onClick={handlePostComment}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Post Comment
      </button>
      <ul className="mt-4 space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b pb-2">
            <p>{comment.text}</p>
            <small className="text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
