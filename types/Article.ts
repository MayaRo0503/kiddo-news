interface Comment {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}
export interface Article {
  _id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishDate: string;
  id: string;
  category: string;
  image: string;
  date: Date;
  likes: number;
  saves: number;
  keyPhrases: string[];
  sentiment: string;
  relevance: number;
  comments: Comment[];
  status: "pending" | "approved" | "rejected" | "pending_correction";
}
