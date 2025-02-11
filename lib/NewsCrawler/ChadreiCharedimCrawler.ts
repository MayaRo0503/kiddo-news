import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class ChadreiCharedimCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.bhol.co.il/news/";

  async crawlMainPage(): Promise<ArticleData[]> {
    throw new Error("Method not implemented for Chadrei Charedim.");
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Crawling Chadrei Charedim article: ${url}`);
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
      console.error(`Failed to crawl Chadrei Charedim article: ${url}`, error);
      throw new Error(
        `Failed to crawl Chadrei Charedim article: ${url} - ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await page.close();
    }
  }

  private async extractArticleData(page: Page): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const title =
        document
          .querySelector("h1.page_title.no_border")
          ?.textContent?.trim() || "";
      const summary =
        document.querySelector("h2.short_text")?.textContent?.trim() || "";
      const authorElements = document.querySelectorAll(
        'span.name[itemprop="author"], .writer_name'
      );
      const authors = Array.from(authorElements)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      const categoryElement = document.querySelector(
        'a[href^="categories/"] span'
      );
      const category = categoryElement?.textContent?.trim() || "";
      const dateElement = document.querySelector(".article_date, time");
      const dateStr = dateElement?.textContent?.trim() || "";

      // Function to check if an element is likely an advertisement
      const isAdvertisement = (element: Element): boolean => {
        const adKeywords = [
          "פרסומת",
          "מודעה",
          "sponsored",
          "ad",
          "advertisement",
        ];
        const text = element.textContent?.toLowerCase() || "";
        return (
          adKeywords.some((keyword) => text.includes(keyword)) ||
          element.id.toLowerCase().includes("ad") ||
          Array.from(element.classList).some((className) =>
            className.toLowerCase().includes("ad")
          )
        );
      };

      // Try multiple selectors for content
      const contentSelectors = [
        "#article_inner",
        ".article_content",
        ".article-body",
        ".article_text",
        "article",
        ".content-area",
      ];

      let content = "";
      for (const selector of contentSelectors) {
        const container = document.querySelector(selector);
        if (container) {
          const paragraphs = Array.from(container.querySelectorAll("p"))
            .filter((p) => !isAdvertisement(p))
            .map((p) => p.textContent?.trim())
            .filter(Boolean);
          content = paragraphs.join("\n\n");
          if (content) break;
        }
      }

      // Check if this is a short/flash news article
      const isShortNews =
        window.location.href.includes("/flash/") ||
        document.querySelector(".flash-news") !== null ||
        title.length < 100;

      return {
        title,
        summary,
        content,
        author: authors.join(", "),
        category,
        dateStr,
        isShortNews,
      };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      category: articleData.category
        ? this.decodeHebrew(articleData.category)
        : undefined,
      source: "Chadrei Charedim",
      originalUrl: page.url(),
      publishDate: this.parseHebrewDate(articleData.dateStr),
      type: articleData.isShortNews ? "flash" : ("article" as const),
    };
  }

  private validateArticleData(articleData: Partial<ArticleData>): boolean {
    if (!articleData.title || articleData.title.length === 0) {
      console.warn("Article title is missing or empty");
      return false;
    }

    // For flash/short news, we don't require content
    const isFlashNews = articleData.type === "flash";
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
