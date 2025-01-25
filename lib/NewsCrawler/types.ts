export interface GPTAnalysis {
  relevance: number;
  sentiment: "positive" | "negative" | "neutral";
  keyPhrases: string[];
  entities: {
    name: string;
    type: string;
  }[];
  summarySentences: string[];
}

export interface ArticleData {
  _id?: string;
  title: string;
  content: string;
  author?: string;
  source: string;
  originalUrl: string;
  publishDate: Date;
  images?: string[];
  summary?: string;
  category?: string;
  subcategory?: string;
  status?: string;
  gptSummary?: string;
  gptAnalysis?: GPTAnalysis;
  keywords?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  relevanceScore?: number;
  subtitles?: string[];
  type?: "article" | "flash"; // Added this field
}

export interface RawArticleRow {
  timeCell: string;
  sourceCell: string;
  title: string;
  url: string;
}
