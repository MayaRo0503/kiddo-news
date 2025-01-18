export interface ArticleData {
  title: string;
  content: string;
  author?: string;
  source: string;
  originalUrl: string;
  publishDate: Date;
  images?: string[];
  summary?: string;
  category?: string;
}

export interface RawArticleRow {
  timeCell: string;
  sourceCell: string;
  title: string;
  url: string;
}
