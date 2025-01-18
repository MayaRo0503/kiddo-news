import { NewsCrawler } from "@/lib/NewsCrawler";

(async () => {
  const crawler = new NewsCrawler();

  try {
    console.log("Initializing crawler...");
    await crawler.initialize();

    const articleUrl = "https://www.ynet.co.il/news/article/sjifeskpkx";
    console.log(`Crawling article: ${articleUrl}`);
    const articleDetails = await crawler.crawlArticle(articleUrl);

    console.log("Crawled article details:", articleDetails);
  } catch (error) {
    console.error("Error during article crawl:", error);
  } finally {
    console.log("Closing crawler...");
    await crawler.close();
  }
})();
