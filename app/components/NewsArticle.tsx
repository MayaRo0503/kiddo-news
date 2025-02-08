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

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
}

export default function NewsArticle({ article }: { article: Article }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comment, setComment] = useState("");

  const handleLike = () => setLikes(likes + 1);
  const handleDislike = () => setDislikes(dislikes + 1);
  const handleComment = () => {
    // Here you would typically send the comment to a backend
    console.log("Comment submitted:", comment);
    setComment("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <div className="text-sm text-muted-foreground">{article.category}</div>
      </CardHeader>
      <CardContent>
        <p>{article.content}</p>
        <div className="mt-4">
          <Textarea
            placeholder="What do you think about this news?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button onClick={handleLike} variant="outline" className="mr-2">
            👍 {likes}
          </Button>
          <Button onClick={handleDislike} variant="outline">
            👎 {dislikes}
          </Button>
        </div>
        <Button onClick={handleComment}>Comment</Button>
      </CardFooter>
    </Card>
  );
}
