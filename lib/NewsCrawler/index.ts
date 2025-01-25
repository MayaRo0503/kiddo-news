import { RotterCrawler } from "./RotterCrawler";
import { YnetCrawler } from "./YnetCrawler";
import { IsraelHayomCrawler } from "./IsraelHayomCrawler";
import { Channel7Crawler } from "./Channel7Crawler";
import { WallaCrawler } from "./WallaCrawler";
import { ChadreiCharedimCrawler } from "./ChadreiCharedimCrawler";
import { IsraelHayomCultureCrawler } from "./IsraelHayomCultureCrawler";
import { ArticleData } from "./types";
import dbConnect from "../mongodb";
import RawArticle from "../../models/RawArticle";
import { sendAlert } from "../alertSystem";
import { Types } from "mongoose";

export class NewsCrawler {
  private rotterCrawler: RotterCrawler;
  private ynetCrawler: YnetCrawler;
  private israelHayomCrawler: IsraelHayomCrawler;
  private channel7Crawler: Channel7Crawler;
  private wallaCrawler: WallaCrawler;
  private chadreiCharedimCrawler: ChadreiCharedimCrawler;
  private israelHayomCultureCrawler: IsraelHayomCultureCrawler;

  constructor() {
    this.rotterCrawler = new RotterCrawler();
    this.ynetCrawler = new YnetCrawler();
    this.israelHayomCrawler = new IsraelHayomCrawler();
    this.channel7Crawler = new Channel7Crawler();
    this.wallaCrawler = new WallaCrawler();
    this.chadreiCharedimCrawler = new ChadreiCharedimCrawler();
    this.israelHayomCultureCrawler = new IsraelHayomCultureCrawler();
  }

  async initialize(): Promise<void> {
    await this.rotterCrawler.initialize();
    await this.ynetCrawler.initialize();
    await this.israelHayomCrawler.initialize();
    await this.channel7Crawler.initialize();
    await this.wallaCrawler.initialize();
    await this.chadreiCharedimCrawler.initialize();
    await this.israelHayomCultureCrawler.initialize();
  }

  async crawlMainPage(): Promise<ArticleData[]> {
    const rotterArticles = await this.rotterCrawler.crawlMainPage();
    const israelHayomCultureArticles =
      await this.israelHayomCultureCrawler.crawlMainPage();
    return [...rotterArticles, ...israelHayomCultureArticles];
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData> | null> {
    if (url.includes("mako.co.il") || url.includes("maariv.co.il")) {
      console.log(
        `Skipping ${
          url.includes("mako.co.il") ? "MAKO" : "Maariv"
        } article: ${url}`
      );
      return null;
    }

    if (url.includes("ynet.co.il")) {
      return this.ynetCrawler.crawlArticle(url);
    } else if (url.includes("israelhayom.co.il/culture")) {
      return this.israelHayomCultureCrawler.crawlArticle(url);
    } else if (url.includes("israelhayom.co.il")) {
      return this.israelHayomCrawler.crawlArticle(url);
    } else if (url.includes("inn.co.il")) {
      return this.channel7Crawler.crawlArticle(url);
    } else if (url.includes("walla.co.il")) {
      return this.wallaCrawler.crawlArticle(url);
    } else if (url.includes("bhol.co.il")) {
      return this.chadreiCharedimCrawler.crawlArticle(url);
    } else {
      return this.rotterCrawler.crawlArticle(url);
    }
  }

  async saveArticle(articleData: ArticleData): Promise<void> {
    console.log("Connecting to MongoDB...");
    await dbConnect();

    try {
      const existingArticle = await RawArticle.findOne({
        $or: [
          { originalUrl: articleData.originalUrl },
          { title: articleData.title },
          { content: articleData.content },
        ],
      });

      if (existingArticle) {
        console.log(
          `Article with URL ${articleData.originalUrl} or similar content already exists. Skipping.`
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

      const savedArticle = await RawArticle.create({
        ...articleData,
        publishDate,
        status: "pre_filtered",
        lastUpdated: new Date(),
      });

      console.log("Article saved successfully.");

      // Prepare for future GPT processing
      if (savedArticle._id instanceof Types.ObjectId) {
        await this.prepareForGptProcessing(savedArticle._id.toString());
      } else {
        console.error("Invalid _id type for saved article");
      }
    } catch (error) {
      console.error("Failed to save article:", error);
      sendAlert(`Failed to save article: ${articleData.title}`);
      throw error;
    }
  }

  private async prepareForGptProcessing(articleId: string): Promise<void> {
    // This method will be implemented in the future to handle GPT processing
    // For now, we'll just update the status to indicate it's ready for GPT processing
    await RawArticle.findByIdAndUpdate(articleId, { status: "pre_filtered" });
  }

  async uploadArticleToSite(articleId: string): Promise<void> {
    // This method will be implemented in the future to upload articles to the site
    // For now, it's just a placeholder
    console.log(`Uploading article ${articleId} to site`);

    // Update the article status to 'pending' after upload
    await RawArticle.findByIdAndUpdate(articleId, { status: "pending" });
  }

  async close(): Promise<void> {
    await this.rotterCrawler.close();
    await this.ynetCrawler.close();
    await this.israelHayomCrawler.close();
    await this.channel7Crawler.close();
    await this.wallaCrawler.close();
    await this.chadreiCharedimCrawler.close();
    await this.israelHayomCultureCrawler.close();
  }
}

export default NewsCrawler;
