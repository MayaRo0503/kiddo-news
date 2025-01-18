import { NewsCrawler } from "@/lib/NewsCrawler";

(async () => {
  const crawler = new NewsCrawler();

  try {
    console.log("Initializing crawler...");
    await crawler.initialize();

    console.log("Crawling main page...");
    const articles = await crawler.crawlMainPage();

    console.log(`Crawled ${articles.length} articles:`);
    articles.forEach((article, index) => {
      console.log(`Article ${index + 1}:`, article);
    });
  } catch (error) {
    console.error("Error during main page crawl:", error);
  } finally {
    console.log("Closing crawler...");
    await crawler.close();
  }
})();
