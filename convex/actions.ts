"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { ApifyClient } from "apify-client";
import { internal } from "./_generated/api";

export const scrapeInstagram = action({
  args: {
    requestId: v.id("catalog_requests"),
    handle: v.string(),
  },
  handler: async (ctx, args) => {
    const client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    // Instagram Scraper Actor (apify/instagram-scraper)
    // Limit to 5 posts as per spec
    const runInput = {
        "addParentData": false,
        "directUrls": [
          `https://www.instagram.com/${args.handle}`
        ],
        "enhanceUserSearchWithFacebookPage": false,
        "isUserReelFeedURL": false,
        "isUserTaggedFeedURL": false,
        "resultsLimit": 5,
        "resultsType": "posts",
        "searchLimit": 5,
        "searchType": "user"
      }

      

    try {
      // Start the actor and wait for it to finish
      const run = await client.actor("apify/instagram-scraper").call(runInput);

      // Fetch results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      // Chain to the internal action for processing
      // Note: Convex automatically maps kebab-case filenames (instagram-ingestion-workflow.ts)
      // to camelCase properties on the internal object (instagramIngestionWorkflow).
      await ctx.runAction(internal.instagramIngestionWorkflow.ingestInstagramPosts, {
        requestId: args.requestId,
        posts: items,
      });
      
      return { status: "success", count: items.length };

    } catch (error) {
      console.error("Apify scrape failed:", error);
      // In a real app, we would update the request status to failed here
      throw new Error("Failed to scrape Instagram");
    }
  },
});

