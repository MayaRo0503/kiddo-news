import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class IsraelHayomCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.israelhayom.co.il/";

  async crawlMainPage(): Promise<ArticleData[]> {
    // This method is not implemented for Israel Hayom as we start from Rotter
    throw new Error("Method not implemented for Israel Hayom.");
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      return this.extractArticleData(page);
    } catch (error) {
      console.error(`Failed to crawl Israel Hayom article: ${url}`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const titleElement = document.querySelector("span.titleText");
      const summaryElement = document.querySelector(
        "h2.single-post-subtitle span.titleText"
      );
      const authorElements = document.querySelectorAll(
        ".single-post-meta-author_names .single-post-meta-author_name a"
      );
      const contentElements = document.querySelectorAll("p");
      const imageElements = document.querySelectorAll(
        "img.single-post-media_image__img"
      );
      const subtitleElements = document.querySelectorAll("h3");
      const categoryElement = document.querySelector(
        'a[href^="https://www.israelhayom.co.il/news/"]'
      );

      const title = titleElement?.textContent?.trim() || "";
      const summary = summaryElement?.textContent?.trim() || "";
      const authors = Array.from(authorElements)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      const author = authors.join(", ");
      const content = Array.from(contentElements)
        .map((p) => p.textContent?.trim())
        .filter((text) => text)
        .join("\n\n");
      const images = Array.from(imageElements)
        .map((img) => (img instanceof HTMLImageElement ? img.src : ""))
        .filter(Boolean);
      const subtitles = Array.from(subtitleElements)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      const category = categoryElement?.textContent?.trim() || "Uncategorized";

      return { title, summary, content, author, images, subtitles, category };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      images: articleData.images,
      category: this.decodeHebrew(articleData.category),
    };
  }
}
