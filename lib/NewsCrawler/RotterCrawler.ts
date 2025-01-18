import { Page } from "puppeteer";
import { BaseCrawler } from "./BaseCrawler";
import { ArticleData, RawArticleRow } from "./types";

export class RotterCrawler extends BaseCrawler {
  protected readonly baseUrl = "https://rotter.net/news/news.php";

  async crawlMainPage(): Promise<ArticleData[]> {
    await this.rateLimit();
    const page = await this.setupPage();

    try {
      console.log(`Navigating to main page: ${this.baseUrl}`);

      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const headers = request.headers();
        headers["Accept"] =
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
        headers["Accept-Encoding"] = "gzip, deflate, br";
        request.continue({ headers });
      });

      await page.goto(this.baseUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const articles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("table tr"))
          .map((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 3) {
              const linkElement = cells[2]?.querySelector("a");
              if (!linkElement) return null;

              return {
                timeCell: cells[0]?.textContent?.trim() || "",
                sourceCell: cells[1]?.textContent?.trim() || "",
                title: linkElement.textContent?.trim() || "",
                url: linkElement.href || "",
              };
            }
            return null;
          })
          .filter((item): item is RawArticleRow => item !== null);
      });

      if (!articles.length) {
        throw new Error(
          "No articles found - possible rate limiting or structure change"
        );
      }

      return articles.map(
        (article: RawArticleRow): ArticleData => ({
          title: this.decodeHebrew(article.title),
          content: "",
          source: this.decodeHebrew(article.sourceCell),
          originalUrl: article.url,
          publishDate: this.parseHebrewDate(article.timeCell),
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
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const headers = request.headers();
        headers["Accept"] =
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
        headers["Accept-Encoding"] = "gzip, deflate, br";
        request.continue({ headers });
      });

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      return this.extractRotterArticleData(page);
    } catch (error) {
      console.error(`Failed to crawl article: ${url}`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async extractRotterArticleData(
    page: Page
  ): Promise<Partial<ArticleData>> {
    const articleData = await page.evaluate(() => {
      const selectors = {
        content: [
          "article",
          ".article-content",
          ".news-content",
          "#articleBody",
        ],
        author: [".author", ".writer", ".article-author"],
        image: ["article img", ".article-image img", ".news-image img"],
      };

      let content = "";
      let author = "";
      const images: string[] = [];

      for (const selector of selectors.content) {
        const element = document.querySelector(selector);
        if (element) {
          content = element.textContent?.trim() || "";
          break;
        }
      }

      for (const selector of selectors.author) {
        const element = document.querySelector(selector);
        if (element) {
          author = element.textContent?.trim() || "";
          break;
        }
      }

      for (const selector of selectors.image) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLImageElement && element.src) {
            images.push(element.src);
          }
        });
      }

      return { content, author, images };
    });

    return {
      ...articleData,
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      images: articleData.images,
    };
  }

  private async extractYnetArticleData(
    page: Page
  ): Promise<Partial<ArticleData>> {
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
        .map((img) => (img instanceof HTMLImageElement ? img.src : ""))
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

  private async extractIsraelHayomArticleData(
    page: Page
  ): Promise<Partial<ArticleData>> {
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

      return { title, summary, content, author, images, subtitles };
    });

    return {
      title: this.decodeHebrew(articleData.title),
      summary: this.decodeHebrew(articleData.summary),
      content: this.decodeHebrew(articleData.content),
      author: articleData.author
        ? this.decodeHebrew(articleData.author)
        : undefined,
      images: articleData.images,
      category: "Israel Hayom", // Default category for Israel Hayom articles
    };
  }
}
