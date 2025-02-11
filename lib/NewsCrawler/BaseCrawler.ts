import { Browser, Page, LaunchOptions } from "puppeteer";
import puppeteer from "puppeteer";
import { setTimeout } from "timers/promises";
import iconv from "iconv-lite";
import { ArticleData } from "./types";

export abstract class BaseCrawler {
  protected browser: Browser | null = null;
  protected readonly minRequestInterval = 10000;
  protected lastRequestTime: number = 0;

  protected abstract readonly baseUrl: string;

  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await setTimeout(this.minRequestInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  async initialize(): Promise<void> {
    console.log("Initializing Puppeteer browser...");
    const launchOptions: LaunchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    };

    this.browser = await puppeteer.launch(launchOptions);
    console.log("Puppeteer browser launched successfully.");
  }

  protected async setupPage(): Promise<Page> {
    if (!this.browser) throw new Error("Browser not initialized");

    const page = await this.browser.newPage();

    await page.setExtraHTTPHeaders({
      "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.evaluateOnNewDocument(() => {
      const meta = document.createElement("meta");
      meta.setAttribute("charset", "utf-8");
      document.head.appendChild(meta);
    });

    return page;
  }

  protected decodeHebrew(text: string): string {
    try {
      const utf8Decoded = iconv.decode(Buffer.from(text), "utf8");
      if (utf8Decoded.includes("�")) {
        return iconv.decode(Buffer.from(text), "windows-1255");
      }
      return utf8Decoded;
    } catch (error) {
      console.error("Error decoding text:", error);
      return text;
    }
  }

  protected parseHebrewDate(dateStr: string): Date {
    try {
      console.log(`Attempting to parse date: "${dateStr}"`);

      if (!dateStr || typeof dateStr !== "string") {
        console.warn("Invalid date string received:", dateStr);
        return new Date();
      }

      const cleanDateStr = dateStr.trim().replace(/\s+/g, " ");
      console.log("Cleaned date string:", cleanDateStr);

      const parts = cleanDateStr.split(" ");
      if (parts.length !== 2) {
        console.warn(
          'Invalid date format (expected "HH:MM DD/MM"):',
          cleanDateStr
        );
        return new Date();
      }

      const [time, date] = parts;
      const [hours, minutes] = time.split(":").map((n) => parseInt(n, 10));
      const [day, month] = date.split("/").map((n) => parseInt(n, 10));
      const year = new Date().getFullYear();

      if (isNaN(hours) || isNaN(minutes) || isNaN(day) || isNaN(month)) {
        console.warn("Invalid numeric values in date parts:", {
          hours,
          minutes,
          day,
          month,
        });
        return new Date();
      }

      if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59 ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12
      ) {
        console.warn("Date values out of valid range:", {
          hours,
          minutes,
          day,
          month,
        });
        return new Date();
      }

      const parsedDate = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(parsedDate.getTime())) {
        console.warn("Failed to create valid date object");
        return new Date();
      }

      console.log(`Successfully parsed date: ${parsedDate}`);
      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  abstract crawlMainPage(): Promise<ArticleData[]>;
  abstract crawlArticle(url: string): Promise<Partial<ArticleData>>;
}
