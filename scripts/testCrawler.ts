import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import "./register-aliases.js";
import NewsCrawler from "../lib/NewsCrawler/index.js";
import dbConnect from "../lib/mongodb.js";

async function main() {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI); // Add this line for debugging
    console.log("Initializing database connection...");
    await dbConnect();

    console.log("Initializing web crawler...");
    const crawler = new NewsCrawler();
    await crawler.initialize();

    console.log("Crawling the main page...");
    const articles = await crawler.crawlMainPage();
    console.log(`Found ${articles.length} articles:`, articles);

    for (const article of articles) {
      console.log(`Crawling details for: ${article.title}`);
      const details = await crawler.crawlArticle(article.originalUrl);
      console.log("Details:", details);

      const articleData = { ...article, ...details };
      console.log("Saving article to the database...");
      await crawler.saveArticle(articleData);
    }

    console.log("All articles processed successfully.");
    await crawler.close();
  } catch (error) {
    console.error("Error during web crawler test:", error);
  }
}

main()
  .then(() => {
    console.log("Crawler test completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unhandled error in crawler test:", error);
    process.exit(1);
  });
