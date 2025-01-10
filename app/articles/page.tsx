"use client";

import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  date: Date;
}

interface APIArticle {
  _id: string; // MongoDB's default ID field
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  date: string; // Dates are typically returned as strings from the API
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data: APIArticle[] = await res.json(); // Explicitly type the API response

        setArticles(
          data.map((article) => ({
            id: article._id,
            title: article.title,
            category: article.category,
            image: article.image,
            content: article.content,
            author: article.author,
            date: new Date(article.date), // Convert date string to a Date object
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-600">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="border rounded p-4">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="text-xl font-bold mt-2">{article.title}</h2>
            <p className="text-gray-600 mt-1">{article.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
