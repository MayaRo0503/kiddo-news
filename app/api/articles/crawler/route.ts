import { type NextRequest, NextResponse } from "next/server";
import NewsCrawler from "@/lib/NewsCrawler";
import dbConnect from "@/lib/mongodb";
import RawArticle from "@/models/RawArticle";
import { authenticateToken } from "@/app/api/auth/common/middleware";

// Make sure to set the CHROME_EXECUTABLE_PATH environment variable
// to the path of your Chrome or Chromium executable
export async function POST(req: NextRequest) {
	try {
		const user = authenticateToken(req);
		if (!user || user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const crawler = new NewsCrawler();
		await crawler.initialize();

		try {
			// Add delay between batches
			const batchSize = 5;
			const batchDelay = 30000; // 30 seconds between batches

			const articles = await crawler.crawlMainPage();
			console.log(`Found ${articles.length} articles on the main page.`);

			let articlesProcessed = 0;

			// Process articles in batches
			for (let i = 0; i < articles.length; i += batchSize) {
				const batch = articles.slice(i, i + batchSize);

				for (const article of batch) {
					try {
						const articleDetails = await crawler.crawlArticle(
							article.originalUrl,
						);
						if (articleDetails) {
							await crawler.saveArticle({
								...article,
								...articleDetails,
							});
							articlesProcessed++;
						} else {
							console.log(`Skipped article: ${article.originalUrl}`);
						}
					} catch (error) {
						console.error(
							"Error processing article:",
							article.originalUrl,
							error instanceof Error ? error.message : String(error),
						);

						await RawArticle.updateOne(
							{ originalUrl: article.originalUrl },
							{
								$set: {
									...article,
									status: "failed",
									processingError:
										error instanceof Error ? error.message : String(error),
									lastUpdated: new Date(),
								},
							},
							{ upsert: true },
						);
					}
				}

				// Add delay between batches if not the last batch
				if (i + batchSize < articles.length) {
					console.log(
						`Waiting ${batchDelay}ms before processing next batch...`,
					);
					await new Promise((resolve) => setTimeout(resolve, batchDelay));
				}
			}

			return NextResponse.json({
				message: "Crawler completed successfully",
				articlesProcessed,
				totalArticles: articles.length,
			});
		} finally {
			await crawler.close();
		}
	} catch (error) {
		console.error("Crawler error:", error);
		return NextResponse.json(
			{
				error: "Internal Server Error",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
