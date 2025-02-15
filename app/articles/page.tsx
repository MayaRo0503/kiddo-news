"use client";

import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import "./articles.css";

interface Article {
  id: string;
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  publishDate: Date;
  isSimplified: boolean;
  likes?: number;
  saves?: number;
  comments?: Comment[];
}

interface APIArticle {
  _id: string;
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  publishDate: Date;
  isSimplified: boolean;
  likes?: number;
  saves?: number;
  comments?: Comment[];
}

const getRandomColor = () => {
  const colors = [
    "from-pink-300 to-purple-300",
    "from-blue-300 to-green-300",
    "from-yellow-300 to-red-300",
    "from-indigo-300 to-blue-300",
    "from-green-300 to-teal-300",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomEmoji = () => {
  const emojis = ["🚀", "🌈", "🦄", "🎨", "🌟", "🔮", "🎭", "🎠"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

const ArticleCard = ({
  article,
  isLoggedIn,
  isVerified,
  onClick,
}: {
  article: Article;
  isLoggedIn: boolean;
  isVerified: boolean;
  onClick: () => void;
}) => {
  const cardColor = getRandomColor();
  const emoji = getRandomEmoji();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`article-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col bg-gradient-to-br ${cardColor}`}
    >
      <div className="absolute top-2 left-2 flex space-x-2">
        <span className="bg-white/80 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
          ❤️ {article.likes}
        </span>
        <span className="bg-white/80 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
          🔖 {article.saves}
        </span>
        <span className="bg-white/80 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
          💬 {article.comments?.length}
        </span>
      </div>
      <div className="relative h-16">
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute top-2 right-2 text-4xl">{emoji}</div>
      </div>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-white/80 text-purple-700">
              {article.category}
            </div>
            {article.isSimplified && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-400 text-white">
                Kid-Friendly
              </div>
            )}
          </div>
          <h2 className="text-1xl font-bold mb-2 text-white drop-shadow-md line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-white/90 mb-4 drop-shadow">
            By {article.author} • {article.publishDate.toLocaleDateString()}
          </p>
        </div>
        {isLoggedIn && isVerified && (
          <div className="flex justify-between items-center mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white hover:text-yellow-300 transition-colors text-lg"
            >
              ❤️ Like
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white hover:text-yellow-300 transition-colors text-lg"
            >
              🔖 Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white hover:text-yellow-300 transition-colors text-lg"
            >
              💬 Comment
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BalloonTitle = ({ text }: { text: string }) => {
  return (
    <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white balloon-text">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          className="letter"
          initial={{ y: 0, filter: "blur(0px)" }}
          animate={{
            y: [0, -20, 0],
            filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  );
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isVerified, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`/api/articles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data: APIArticle[] = await res.json();

        const transformedArticles = data.map((article) => ({
          id: article._id,
          title: article.title,
          category: article.category,
          image: article.image || "",
          content: article.content,
          author: article.author,
          publishDate: new Date(article.publishDate),
          isSimplified: article.isSimplified,
          likes: article.likes || 0,
          saves: article.saves || 0,
          comments: article.comments || [],
        }));

        setArticles(
          isLoggedIn ? transformedArticles : transformedArticles.slice(0, 6)
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setLoading(false);
      }
    }

    fetchArticles();
  }, [isLoggedIn, token]);

  const handleArticleClick = (id: string) => {
    if (isLoggedIn) {
      router.push(`/articles/${id}`);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="text-center">
          <div className="animate-bounce text-8xl mb-4">📚</div>
          <p className="text-3xl font-bold text-white drop-shadow-md balloon-text">
            Loading amazing stories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 py-12 articles-bg">
      <div className="max-w-7xl mx-auto px-4">
        <BalloonTitle text="Discover - Amazing - Stories!" />
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-lg"
        >
          ✨📚🌈
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 auto-rows-fr">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ArticleCard
                article={article}
                isLoggedIn={isLoggedIn}
                isVerified={isVerified}
                onClick={() => handleArticleClick(article.id)}
              />
            </motion.div>
          ))}
        </div>

        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto shadow-xl">
              <Lock className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold text-purple-700 mb-4">
                Want to See More Amazing Stories?
              </h2>
              <p className="text-purple-600 mb-6 text-lg">
                Log in to unlock all articles and join the fun! You&apos;ll be
                able to like, save, and comment on all stories! 🎉🚀🌟
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Login to Explore More! 🚀
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
