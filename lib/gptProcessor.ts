/* eslint-disable prefer-const */
import type { GPTAnalysis, IRawArticle } from "../models/RawArticle";
import RawArticle from "../models/RawArticle";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Retry mechanism with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error) {
        // Check if it's a rate limit error
        if (
          error.message.includes("429") ||
          error.message.includes("Too Many Requests")
        ) {
          const delay = initialDelay * Math.pow(2, i); // Exponential backoff
          console.log(
            `Rate limit hit. Waiting ${delay}ms before retry ${
              i + 1
            }/${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }
      throw error;
    }
  }

  throw lastError || new Error("Max retries reached");
}

// The main GPT processing function
async function processArticleInternal(articleId: string): Promise<IRawArticle> {
  console.log(`Processing article with GPT: ${articleId}`);

  try {
    // 1. Load article from DB
    const article = await RawArticle.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    // 2. Only process if status is "pre_filtered"
    if (article.status !== "pre_filtered") {
      console.log(
        `Article ${articleId} is already processed. Current status: ${article.status}`
      );
      return article;
    }

    // 3. Mark as "pending"
    article.status = "pending";
    await article.save();

    // 4. Summarize with GPT
    const summarizationPrompt = `
      Summarize the following article in simple, child-friendly language:
      Title: ${article.title}
      Content: ${article.content}
      
      Provide a brief summary that a child can understand, focusing on the main points and avoiding any complex or sensitive topics.
    `;

    let childFriendlySummary = "";
    try {
      const summarizationResponse = await retryOperation(
        () =>
          openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: summarizationPrompt }],
            max_tokens: 300,
          }),
        5, // max retries for summarization
        3000 // initial delay for summarization
      );
      childFriendlySummary =
        summarizationResponse.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary");
    }

    // 5. Delay between API calls (one second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 6. Analysis prompt
    const analysisPrompt = `
      Analyze the following article:
      Title: ${article.title}
      Content: ${article.content}
      
      Provide the following:
      1. Relevance score (0-1)
      2. Sentiment (positive, negative, or neutral)
      3. Key phrases (up to 5)
      4. Main entities mentioned (up to 3)
      5. Age range recommendation (e.g., "8-12")
    `;

    let analysisResult = "";
    try {
      const analysisResponse = await retryOperation(
        () =>
          openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: analysisPrompt }],
            max_tokens: 200,
          }),
        5, // max retries for analysis
        3000 // initial delay for analysis
      );
      analysisResult = analysisResponse.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error analyzing content:", error);
      throw new Error("Failed to analyze content");
    }

    // 7. Extract fields from analysisResult
    const relevance = Number.parseFloat(
      analysisResult.match(/Relevance score: ([\d.]+)/)?.[1] || "0.5"
    );

    // -- Fix for capital or unknown sentiment --
    let sentimentRaw =
      analysisResult.match(/Sentiment: (\w+)/)?.[1] || "neutral";
    sentimentRaw = sentimentRaw.toLowerCase();
    if (!["positive", "negative", "neutral"].includes(sentimentRaw)) {
      sentimentRaw = "neutral";
    }
    const sentiment = sentimentRaw as "positive" | "negative" | "neutral";
    // ------------------------------------------

    const keyPhrases =
      analysisResult
        .match(/Key phrases:([\s\S]*?)(?:\n\n|$)/)?.[1]
        .split("\n")
        .map((phrase) => phrase.trim())
        .filter(Boolean) || [];

    const entities =
      analysisResult
        .match(/Main entities:([\s\S]*?)(?:\n\n|$)/)?.[1]
        .split("\n")
        .map((entity) => {
          const [name, type] = entity.split(":").map((s) => s.trim());
          return { name, type };
        })
        .filter((e) => e.name && e.type) || [];

    const ageRange =
      analysisResult.match(/Age range recommendation: ([\d-]+)/)?.[1] || "";

    const gptAnalysis: GPTAnalysis = {
      relevance,
      sentiment, // now guaranteed valid
      keyPhrases,
      entities,
      summarySentences: [childFriendlySummary],
    };

    // 8. Update and save the article
    article.status = "gpt_filtered";
    article.gptSummary = childFriendlySummary;
    article.gptAnalysis = gptAnalysis;
    article.keywords = keyPhrases;
    article.sentiment = sentiment; // valid value now
    article.relevanceScore = relevance;
    article.ageRange = ageRange;
    await article.save();

    return article;
  } catch (error) {
    console.error(`Error processing article ${articleId} with GPT:`, error);
    await RawArticle.findByIdAndUpdate(articleId, {
      status: "failed",
      processingError: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// The rest of your queue logic remains unchanged:
class ProcessingQueue {
  private queue: string[] = [];
  private processing = false;
  private static instance: ProcessingQueue;

  private constructor() {}

  static getInstance(): ProcessingQueue {
    if (!ProcessingQueue.instance) {
      ProcessingQueue.instance = new ProcessingQueue();
    }
    return ProcessingQueue.instance;
  }

  async add(articleId: string): Promise<void> {
    this.queue.push(articleId);
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const articleId = this.queue.shift();
    if (!articleId) return;

    try {
      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await processArticleInternal(articleId);
    } catch (error) {
      console.error(`Error processing article ${articleId}:`, error);
    } finally {
      await this.processQueue();
    }
  }
}

export async function processArticleWithGPT(
  articleId: string
): Promise<IRawArticle> {
  const queue = ProcessingQueue.getInstance();
  await queue.add(articleId);
  return RawArticle.findById(articleId) as Promise<IRawArticle>;
}

// New function for re-filtering articles based on admin feedback
export async function refilterArticle(
  article: IRawArticle,
  adminComments: string,
  targetAgeRange: string
): Promise<IRawArticle> {
  console.log(`Re-filtering article: ${article._id}`);

  // <-- CHANGED PROMPT: Force GPT to return exactly 3 lines
  const prompt = `
    Please rewrite the following article summary to make it suitable for children aged ${targetAgeRange}.
    Consider the following admin feedback: "${adminComments}".
    
    ORIGINAL SUMMARY:
    ${article.gptSummary}

    ---
    **IMPORTANT**: Output exactly 3 lines (no extra text). 
    Line 1: The rewritten summary (child-friendly).
    Line 2: One of "positive", "negative", or "neutral" (sentiment).
    Line 3: A relevance score between 0 and 1.
  `;

  try {
    const response = await retryOperation(
      () =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        }),
      5, // max retries
      3000 // initial delay
    );

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error("No result from GPT");

    // <-- ADDED PARSING: Split into exactly 3 lines
    const lines = result
      .split(/\n\s*\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // lines[0]: new summary
    let newSummary = lines[0] || "";
    // lines[1]: new sentiment
    let newSentiment = lines[1]?.toLowerCase() || "neutral";
    // lines[2]: new relevance score
    let rawScore = parseFloat(lines[2] || "0.5");

    // Ensure sentiment is valid
    if (!["positive", "negative", "neutral"].includes(newSentiment)) {
      newSentiment = "neutral";
    }

    // Clamp relevanceScore to [0..1]
    if (isNaN(rawScore)) rawScore = 0.5;
    rawScore = Math.min(1, Math.max(0, rawScore));

    article.gptSummary = newSummary;
    article.sentiment = newSentiment as "positive" | "negative" | "neutral";
    article.relevanceScore = rawScore;

    // We still set this so we see it's re-processed by GPT
    article.status = "gpt_filtered";

    // Also keep the original fields updated
    article.ageRange = targetAgeRange;
    article.adminComments = adminComments;

    console.log(
      "gptProcessor##################################################### "
    );
    console.log("Re-filtering completed for article _id :", article._id);
    console.log("adminComments", article.adminComments);
    console.log("ageRange ", article.ageRange);
    console.log("gptSummary ", article.gptSummary);

    await article.save();
    console.log(`Re-filtering completed for article: ${article._id}`);
    return article;
  } catch (error) {
    console.error("Error in refilterArticle:", error);
    article.status = "failed";
    article.processingError =
      error instanceof Error ? error.message : String(error);
    await article.save();
    throw error;
  }
}
