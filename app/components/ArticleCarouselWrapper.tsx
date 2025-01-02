"use client";

import ArticleCarousel from "./ArticleCarousel";

interface Article {
  id: string; // Use string for IDs as per your DB model
  title: string;
  category: string;
  image: string;
  content: string;
  author: string;
  date: Date;
}

interface ArticleCarouselWrapperProps {
  articles: Article[];
}

const ArticleCarouselWrapper: React.FC<ArticleCarouselWrapperProps> = ({
  articles,
}) => {
  return <ArticleCarousel articles={articles} />;
};

export default ArticleCarouselWrapper;
