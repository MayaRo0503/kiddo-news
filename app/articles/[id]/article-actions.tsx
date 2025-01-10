"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";

export function ArticleActions({
  id,
  likes,
  saves,
}: {
  id: string;
  likes: number;
  saves: number;
}) {
  const [likeCount, setLikeCount] = useState(likes);
  const [saveCount, setSaveCount] = useState(saves);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = async () => {
    const response = await fetch(`/api/articles/${id}/like`, {
      method: "POST",
      body: JSON.stringify({ like: !liked }),
    });
    if (response.ok) {
      setLiked(!liked);
      setLikeCount((prev) => prev + (liked ? -1 : 1));
    }
  };

  const toggleSave = async () => {
    const response = await fetch(`/api/articles/${id}/save`, {
      method: "POST",
      body: JSON.stringify({ save: !saved }),
    });
    if (response.ok) {
      setSaved(!saved);
      setSaveCount((prev) => prev + (saved ? -1 : 1));
    }
  };

  return (
    <div className="flex space-x-4">
      <button onClick={toggleLike}>
        <Heart className={liked ? "text-red-500" : "text-gray-500"} />
        {likeCount} Likes
      </button>
      <button onClick={toggleSave}>
        <Bookmark className={saved ? "text-yellow-500" : "text-gray-500"} />
        {saveCount} Saves
      </button>
    </div>
  );
}
