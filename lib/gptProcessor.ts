import { ArticleData, GPTAnalysis } from "./NewsCrawler/types";
import RawArticle from "../models/RawArticle";

export async function processArticleWithGPT(
  article: ArticleData
): Promise<ArticleData> {
  console.log("GPT processing placeholder for article:", article.title);

  if (article._id) {
    await RawArticle.findByIdAndUpdate(article._id, { status: "pre_filtered" });
  }

  const gptAnalysis: GPTAnalysis = {
    relevance: 0.5,
    sentiment: "neutral",
    keyPhrases: ["placeholder", "key", "phrases"],
    entities: [{ name: "Placeholder Entity", type: "Organization" }],
    summarySentences: ["This is a placeholder summary sentence."],
  };

  return {
    ...article,
    status: "gpt_filtered",
    gptSummary: "This is a placeholder GPT summary.",
    gptAnalysis: gptAnalysis,
    keywords: ["placeholder", "keywords"],
    sentiment: "neutral",
    relevanceScore: 0.5,
  };
}
