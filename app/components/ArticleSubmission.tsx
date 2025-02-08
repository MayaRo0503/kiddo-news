"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

export function ArticleSubmission() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Filter the article using ChatGPT
      const filterResponse = await fetch("/api/filter-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (!filterResponse.ok) {
        throw new Error("Failed to filter article");
      }

      const { article } = await filterResponse.json();

      if (article) {
        toast.success("Article submitted for approval");
        setTitle("");
        setContent("");
        setCategory("");
      } else {
        throw new Error("Failed to create article");
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Failed to submit article");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Article Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Article Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={10}
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="World">World</SelectItem>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Environment">Environment</SelectItem>
          <SelectItem value="Culture">Culture</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Submit Article</Button>
    </form>
  );
}
