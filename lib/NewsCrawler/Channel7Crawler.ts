import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class Channel7Crawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.inn.co.il/";

  async crawlMainPage(): Promise<ArticleData[]> {
    throw new Error("Method not implemented for Channel 7.");
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Crawling Channel 7 article: ${url}`);
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const articleData = await this.extractArticleData(page);

      if (!this.validateArticleData(articleData)) {
        throw new Error("Invalid article data extracted");
      }

      console.log(
        `Successfully extracted data for article: ${articleData.title}`
      );
      return articleData;
    } catch (error) {
      console.error(`Failed to crawl Channel 7 article: ${url}`, error);
      throw new Error(
        `Failed to crawl Channel 7 article: ${url} - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.article-title");
      const summaryElement = document.querySelector("h2.article-summary");
      const authorElements = document.querySelectorAll(
        "a.article-info--author"
      );
      const contentElements = document.querySelectorAll(".article-body p");
      const dateElement = document.querySelector("time");
      const isFlashNews = window.location.href.includes("/flashes/");

      const title = titleElement?.textContent?.trim() || "";
      const summary = summaryElement?.textContent?.trim() || "";
      const authors = Array.from(authorElements)
        .map((el) => el.textContent?.trim())
        .filter((text): text is string => text !== null && text !== undefined);
      const content = Array.from(contentElements)
        .map((p) => p.textContent?.trim())
        .filter((text): text is string => text !== null && text !== undefined)
        .join("\n\n");
      const publishDateStr = dateElement?.getAttribute("datetime") || "";

      return {
        title,
        summary,
        content,
        author: authors.join(", "),
        publishDateStr,
        isFlashNews,
      };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      source: "Channel 7",
      originalUrl: page.url(),
      publishDate: articleData.publishDateStr
        ? new Date(articleData.publishDateStr)
        : new Date(),
      category: articleData.isFlashNews ? "Flash News" : "News",
    };
  }

  private validateArticleData(articleData: Partial<ArticleData>): boolean {
    if (!articleData.title || articleData.title.length === 0) {
      console.warn("Article title is missing or empty");
      return false;
    }

    // For flash news, we don't require content
    const isFlashNews = articleData.category === "Flash News";
    if (
      !isFlashNews &&
      (!articleData.content || articleData.content.length === 0)
    ) {
      console.warn("Article content is missing or empty");
      return false;
    }

    return true;
  }
}
