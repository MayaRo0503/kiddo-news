"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const hideScrollbarCSS = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface Article {
  id: number;
  title: string;
  category: string;
  image: string;
}

interface ArticleCarouselProps {
  articles: Article[];
}

const ArticleCarousel: React.FC<ArticleCarouselProps> = ({ articles }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleScroll = () => {
        const position = container.scrollLeft;
        setScrollPosition(position);
        setShowLeftArrow(position > 0);
        setShowRightArrow(
          position < container.scrollWidth - container.clientWidth
        );
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth;
      const targetScroll =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <style>{hideScrollbarCSS}</style>
      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="flex-shrink-0 scroll-snap-align-start"
          >
            <div className="w-64 bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-blue-600">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600">{article.category}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 shadow-md transition-opacity duration-200 hover:bg-opacity-75"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-blue-600" />
        </button>
      )}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 shadow-md transition-opacity duration-200 hover:bg-opacity-75"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default ArticleCarousel;
