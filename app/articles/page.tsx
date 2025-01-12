"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

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
  _id: string;
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  date: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data: APIArticle[] = await res.json();

        const transformedArticles = data.map((article) => ({
          id: article._id,
          title: article.title,
          category: article.category,
          image: article.image || "", // Don't set a default here
          content: article.content,
          author: article.author,
          date: new Date(article.date),
        }));

        setArticles(
          isLoggedIn ? transformedArticles : transformedArticles.slice(0, 2)
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setLoading(false);
      }
    }

    fetchArticles();
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">📚</div>
          <p className="text-2xl font-bold text-purple-600">
            Loading amazing stories...
          </p>
        </div>
      </div>
    );
  }

  const ArticleCard = ({ article }: { article: Article }) => {
    const handleClick = (e: React.MouseEvent) => {
      if (!isLoggedIn) {
        e.preventDefault();
        router.push("/auth");
      }
    };

    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      >
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent" />
        </div>
        <div className="p-6">
          <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-600 mb-3">
            {article.category}
          </div>
          <h2 className="text-xl font-bold mb-2 text-purple-700 line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            By {article.author} • {article.date.toLocaleDateString()}
          </p>
          {isLoggedIn && isVerified && (
            <div className="flex justify-between items-center">
              <button className="text-purple-500 hover:text-purple-700 transition-colors">
                ❤️ Like
              </button>
              <button className="text-purple-500 hover:text-purple-700 transition-colors">
                🔖 Save
              </button>
              <button className="text-purple-500 hover:text-purple-700 transition-colors">
                💬 Comment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-purple-600 animate-bounce-slow">
          Discover Amazing Stories! ✨
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              href={isLoggedIn ? `/articles/${article.id}` : "#"}
              key={article.id}
              onClick={
                !isLoggedIn
                  ? (e) => {
                      e.preventDefault();
                      router.push("/auth");
                    }
                  : undefined
              }
            >
              <ArticleCard article={article} />
            </Link>
          ))}
        </div>

        {!isLoggedIn && (
          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto shadow-xl">
              <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce-slow" />
              <h2 className="text-2xl font-bold text-purple-700 mb-4">
                Want to See More Amazing Stories?
              </h2>
              <p className="text-purple-600 mb-6">
                Log in to unlock all articles and join the fun! You&apos;ll be
                able to like, save, and comment on all stories! 🎉
              </p>
              <button
                onClick={() => router.push("/auth")}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                Login to Explore More! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
