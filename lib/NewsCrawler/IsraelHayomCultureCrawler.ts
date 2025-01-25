import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData } from "./types";

export class IsraelHayomCultureCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://www.israelhayom.co.il/culture";

  async crawlMainPage(): Promise<ArticleData[]> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Navigating to main page: ${this.baseUrl}`);

      await page.goto(this.baseUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const articles = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll('a[href^="/culture/"]')
        ).map((link) => {
          const titleElement = link.querySelector(".titleText");
          const subcategoryElement = link
            .closest("section")
            ?.querySelector(".titleText .bold");

          return {
            title: titleElement?.textContent?.trim() || "",
            url: (link as HTMLAnchorElement).href,
            subcategory: subcategoryElement?.textContent?.trim() || "",
          };
        });
      });

      return articles.map(
        (article): ArticleData => ({
          title: this.decodeHebrew(article.title),
          content: "",
          source: "Israel Hayom",
          originalUrl: article.url,
          category: "Culture",
          subcategory: this.decodeHebrew(article.subcategory),
          publishDate: new Date(), // We'll update this when crawling the individual article
        })
      );
    } catch (error) {
      console.error("Error during main page crawling:", error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async crawlArticle(url: string): Promise<Partial<ArticleData>> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Crawling Israel Hayom Culture article: ${url}`);
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
      console.error(
        `Failed to crawl Israel Hayom Culture article: ${url}`,
        error
      );
      throw new Error(
        `Failed to crawl Israel Hayom Culture article: ${url} - ${
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
        document.querySelector("h1.single-post-title")?.textContent?.trim() ||
        "";
      const summary =
        document
          .querySelector("h2.single-post-subtitle .titleText")
          ?.textContent?.trim() || "";
      const authorElement = document.querySelector('a[href^="/writer/"]');
      const author = authorElement?.textContent?.trim() || "";
      const contentElements = document.querySelectorAll("#text-content p");
      const content = Array.from(contentElements)
        .map((el) => el.textContent?.trim())
        .filter(
          (text) =>
            text &&
            !text.includes("To register for") &&
            !text.includes("To Israel Hayom")
        )
        .join("\n\n");
      const subcategory =
        document
          .querySelector(".single-post-category .titleText")
          ?.textContent?.trim() || "";
      const publishDateElement = document.querySelector(
        ".single-post-meta-dates time"
      );
      const publishDateStr = publishDateElement
        ? publishDateElement.getAttribute("datetime")
        : "";

      return { title, summary, content, author, subcategory, publishDateStr };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      source: "Israel Hayom",
      category: "Culture",
      subcategory: articleData.subcategory
        ? this.decodeHebrew(articleData.subcategory)
        : undefined,
      originalUrl: page.url(),
      publishDate: articleData.publishDateStr
        ? new Date(articleData.publishDateStr)
        : new Date(),
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
