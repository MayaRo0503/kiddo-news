import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class IsraelHayomCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.israelhayom.co.il/";

  async crawlMainPage(): Promise<ArticleData[]> {
    throw new Error("Method not implemented for Israel Hayom.");
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Crawling Israel Hayom article: ${url}`);
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
      console.error(`Failed to crawl Israel Hayom article: ${url}`, error);
      throw new Error(
        `Failed to crawl Israel Hayom article: ${url} - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const titleElement = document.querySelector(
        "span.titleText, h1.single-post-title"
      );
      const summaryElement = document.querySelector(
        "h2.single-post-subtitle span.titleText, .single-post-excerpt"
      );
      const authorElements = document.querySelectorAll(
        ".single-post-meta-author_names .single-post-meta-author_name a, .single-post-meta .author"
      );
      const contentElements = document.querySelectorAll(
        ".single-post-content p, article p"
      );
      const imageElements = document.querySelectorAll(
        "img.single-post-media_image__img, .single-post-media img"
      );
      const subtitleElements = document.querySelectorAll(
        "h3, .single-post-content h2"
      );
      const categoryElement = document.querySelector(
        'a[href^="https://www.israelhayom.co.il/news/"], .breadcrumbs a:last-child'
      );

      const title = titleElement?.textContent?.trim() || "";
      const summary = summaryElement?.textContent?.trim() || "";
      const authors = Array.from(authorElements)
        .map((el) => el.textContent?.trim())
        .filter((text): text is string => text !== null && text !== undefined);
      const author = authors.join(", ");
      const content = Array.from(contentElements)
        .map((p) => p.textContent?.trim())
        .filter((text): text is string => text !== null && text !== undefined)
        .join("\n\n");
      const images = Array.from(imageElements)
        .map((img) => {
          if (img instanceof HTMLImageElement) {
            return img.src || img.getAttribute("data-src") || "";
          }
          return "";
        })
        .filter(Boolean);
      const subtitles = Array.from(subtitleElements)
        .map((el) => el.textContent?.trim())
        .filter((text): text is string => text !== null && text !== undefined);
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
      subtitles: articleData.subtitles?.map((subtitle) =>
        this.decodeHebrew(subtitle)
      ),
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
