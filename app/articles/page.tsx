"use client";

import React, { useState, useEffect } from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import { Article } from "models/Article"; // Import the Article type

const categories = ["All", "Technology", "History", "Mathematics", "Culture"];

export default function ArticlesPage({ articles }: { articles: Article[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Ensure articles is an array before filtering
  const filteredArticles = Array.isArray(articles)
    ? selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory)
    : []; // If articles is undefined or not an array, use an empty array

  useEffect(() => {
    if (!Array.isArray(articles)) {
      console.error("Expected articles to be an array but got", articles);
    }
  }, [articles]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600">
        Explore Kiddo News Articles
      </h1>

      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                if (category !== selectedCategory) {
                  // Only update if category has changed
                  setSelectedCategory(category);
                }
              }}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 hover:bg-blue-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          {selectedCategory} Articles
        </h2>
        {filteredArticles && filteredArticles.length > 0 ? (
          <ArticleCarousel articles={filteredArticles} />
        ) : (
          <div>No articles available in this category.</div>
        )}
      </div>
    </div>
  );
}
