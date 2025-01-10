import React from "react";
import ArticleCarousel from "./ArticleCarousel";
import { Article } from "types/Article";

interface ArticleCarouselWrapperProps {
  articles: Article[]; // Ensure this matches the structure in your Article type
}

const ArticleCarouselWrapper: React.FC<ArticleCarouselWrapperProps> = ({
  articles,
}) => {
  return (
    <div className="article-carousel-wrapper">
      <ArticleCarousel articles={articles} />
    </div>
  );
};

export default ArticleCarouselWrapper;
