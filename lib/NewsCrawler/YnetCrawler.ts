import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class YnetCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.ynet.co.il/news";

  async crawlMainPage(): Promise<ArticleData[]> {
    // This method is not implemented for Ynet as we start from Rotter
    throw new Error("Method not implemented for Ynet.");
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
      console.error(`Failed to crawl Ynet article: ${url}`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.mainTitle");
      const summaryElement = document.querySelector("span.subTitle");
      const authorElements = document.querySelectorAll(
        '.authorAndDateContainer a[href*="/topics/"], .authoranddate .authors a[href*="/topics/"]'
      );
      const contentSpans = Array.from(
        document.querySelectorAll('span[data-text="true"]')
      );
      const imageElements = document.querySelectorAll(
        'img[id^="ReduxEditableImage_"]'
      );
      const categoryElement = document.querySelector(
        'a[href^="/news/category/"]'
      );

      const title = titleElement?.textContent?.trim() || "";
      const summary = summaryElement?.textContent?.trim() || "";
      const authors = Array.from(authorElements)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      const author = authors.join(", ");
      const content = contentSpans
        .map((span) => span.textContent?.trim())
        .filter((text) => text)
        .join("\n\n");
      const images = Array.from(imageElements)
        .map((img) => (img as HTMLImageElement).src)
        .filter(Boolean);
      const category = categoryElement?.textContent?.trim() || "";

      return { title, summary, content, author, images, category };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      images: articleData.images,
      category: articleData.category
        ? this.decodeHebrew(articleData.category)
        : undefined,
    };
  }
}
