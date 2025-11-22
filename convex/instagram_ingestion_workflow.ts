"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { extractProductDataFromCaption } from "./steps/parse_post";
import { processAndUploadProductImage } from "./steps/process_image";

export const ingestInstagramPosts = internalAction({
  args: {
    requestId: v.id("catalog_requests"),
    posts: v.array(v.any()), // Raw Apify post objects
  },
  handler: async (ctx, args) => {
    console.log(`Processing ${args.posts.length} posts for request ${args.requestId}`);
    
    const request: Doc<"catalog_requests"> | null = await ctx.runQuery(internal.requests.getRequest, { id: args.requestId });
    if (!request) {
      throw new Error("Request not found");
    }
    const handle = request.handle;

    const results = [];

    for (const post of args.posts) {
        // 1. Text Analysis (Gemini)
        const caption = post.caption || "";
        const extracted = await extractProductDataFromCaption(caption);

        // 2. Filtering
        // If no price, discard
        if (!extracted || extracted.price === null) {
          console.log(`Skipping post ${post.id}: No valid price found.`);
          continue;
        }

        // Ensure price is number
        const safePrice: number = extracted.price;

        console.log(`Found product: ${extracted.productName} - ${safePrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`);

        // 3. Image Processing
        const processedImageUrl = await processAndUploadProductImage(ctx, post.displayUrl, extracted.productName) || post.displayUrl;
        console.log(processedImageUrl)
        // 4. Generate Mercado Pago Preference
        let mercadoPagoLink: string | undefined;
        try {
            // Only attempt if we have a valid price and name
            if (safePrice > 0 && extracted.productName) {
                 const link = await ctx.runAction(internal.mercadopago.createPreference, {
                    handle,
                    title: extracted.productName,
                    price: safePrice,
                    imageUrl: processedImageUrl,
                }) as string | null;
                if (link) mercadoPagoLink = link;
            }
        } catch (e) {
            console.error(`Failed to create MP preference for ${extracted.productName}:`, e);
        }

        results.push({
          productName: extracted.productName,
          price: safePrice,
          currency: "CLP",
          size: extracted.size || undefined,
          originalImageUrl: post.displayUrl,
          processedImageUrl: processedImageUrl,
          igPostUrl: post.url,
          mercadoPagoLink,
        });
    }

    // 4. Save Results
    if (results.length > 0) {
      await ctx.runMutation(internal.requests.addProducts, {
        requestId: args.requestId,
        products: results,
      });
    }

    console.log("Valid products saved:", results.length);
    return { processed: results.length, valid: results };
  },
});
