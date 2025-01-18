import { RotterCrawler } from "./RotterCrawler";
import { YnetCrawler } from "./YnetCrawler";
import { IsraelHayomCrawler } from "./IsraelHayomCrawler";
import { ArticleData } from "./types";
import dbConnect from "../mongodb";
import RawArticle from "../../models/RawArticle";

export class NewsCrawler {
  private rotterCrawler: RotterCrawler;
  private ynetCrawler: YnetCrawler;
  private israelHayomCrawler: IsraelHayomCrawler;

  constructor() {
    this.rotterCrawler = new RotterCrawler();
    this.ynetCrawler = new YnetCrawler();
    this.israelHayomCrawler = new IsraelHayomCrawler();
  }

  async initialize(): Promise<void> {
    await this.rotterCrawler.initialize();
    await this.ynetCrawler.initialize();
    await this.israelHayomCrawler.initialize();
  }

  async crawlMainPage(): Promise<ArticleData[]> {
    return this.rotterCrawler.crawlMainPage();
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    if (url.includes("ynet.co.il")) {
      return this.ynetCrawler.crawlArticle(url);
    } else if (url.includes("israelhayom.co.il")) {
      return this.israelHayomCrawler.crawlArticle(url);
    } else {
      return this.rotterCrawler.crawlArticle(url);
    }
  }

  async saveArticle(articleData: ArticleData): Promise<void> {
    console.log("Connecting to MongoDB...");
    await dbConnect();

    try {
      const existingArticle = await RawArticle.findOne({
        originalUrl: articleData.originalUrl,
      });

      if (existingArticle) {
        console.log(
          `Article with URL ${articleData.originalUrl} already exists. Skipping.`
        );
        return;
      }

      const publishDate =
        articleData.publishDate instanceof Date &&
        !isNaN(articleData.publishDate.getTime())
          ? articleData.publishDate
          : new Date();

      console.log(`Saving article: ${articleData.title}`);
      console.log(`With publish date: ${publishDate}`);

      await RawArticle.create({
        ...articleData,
        publishDate,
        status: "pending",
        lastUpdated: new Date(),
      });

      console.log("Article saved successfully.");
    } catch (error) {
      console.error("Failed to save article:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.rotterCrawler.close();
    await this.ynetCrawler.close();
    await this.israelHayomCrawler.close();
  }
}

export default NewsCrawler;
