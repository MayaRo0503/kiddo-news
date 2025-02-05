import cron from "node-cron";
import { NewsCrawler } from "./NewsCrawler";

export function startScheduler(): void {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily crawler job");
    const crawler = new NewsCrawler();
    await crawler.initialize();

    try {
      const articles = await crawler.crawlMainPage();
      for (const article of articles) {
        const articleDetails = await crawler.crawlArticle(article.originalUrl);
        await crawler.saveArticle({
          ...article,
          ...articleDetails,
        });
      }
    } catch (error) {
      console.error("Error in scheduled crawler job:", error);
    } finally {
      await crawler.close();
    }
  });
}
