import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class WallaCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://news.walla.co.il/";

  async crawlMainPage(): Promise<ArticleData[]> {
    throw new Error("Method not implemented for Walla.");
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Crawling Walla article: ${url}`);
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
      console.error(`Failed to crawl Walla article: ${url}`, error);
      throw new Error(
        `Failed to crawl Walla article: ${url} - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const isFlashNews = window.location.href.includes("/break/");
      let title, summary, content, author;

      if (isFlashNews) {
        title =
          document
            .querySelector("h1.breaking-item-title-in-single-break")
            ?.textContent?.trim() || "";
        const contentElement = document.querySelector("p.article_speakable");
        content = contentElement?.textContent?.trim() || "";
        summary = content; // For flash news, summary is the same as content
        author =
          document
            .querySelector("p.content-provider-text")
            ?.textContent?.trim() || "";
      } else {
        title =
          document
            .querySelector("h1.title.article_speakable")
            ?.textContent?.trim() || "";
        summary =
          document
            .querySelector("h2.subtitle.article_speakable")
            ?.textContent?.trim() || "";
        const contentElements = document.querySelectorAll(
          "p.article_speakable"
        );
        content = Array.from(contentElements)
          .map((el) => el.textContent?.trim())
          .filter((text) => text)
          .join("\n\n");
        const authorElements = document.querySelectorAll(
          "div.writer-name-item p"
        );
        author = Array.from(authorElements)
          .map((el) => el.textContent?.trim())
          .filter((text) => text)
          .join(", ");
      }

      return { title, summary, content, author };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      source: "Walla",
      originalUrl: page.url(),
    };
  }

  private validateArticleData(articleData: Partial<ArticleData>): boolean {
    if (!articleData.title || articleData.title.length === 0) {
      console.warn("Article title is missing or empty");
      return false;
    }
    if (!articleData.content || articleData.content.length === 0) {
      console.warn("Article content is missing or empty");
      return false;
    }
    return true;
  }
}
