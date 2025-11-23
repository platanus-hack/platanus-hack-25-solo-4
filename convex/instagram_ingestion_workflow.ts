"use node";

import { internalAction, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { extractProductDataFromCaption } from "./steps/parse_post";
import { processAndUploadProductImage } from "./steps/process_image";

const BATCH_SIZE = 2;

interface ProcessedResult {
  productName: string;
  price: number;
  currency: string;
  size: string | undefined;
  originalImageUrl: string;
  processedImageUrl: string | undefined;
  igPostUrl: string;
  mercadoPagoLink: string | undefined;
}

async function createMPLink(
    ctx: ActionCtx, 
    handle: string, 
    productName: string, 
    price: number, 
    imageUrl: string
): Promise<string | undefined> {
    try {
        if (price > 0 && productName) {
             const link = await ctx.runAction(internal.mercadopago.createPreference, {
                handle,
                title: productName,
                price: price,
                imageUrl: imageUrl,
            }) as string | null;
            return link || undefined;
        }
    } catch (e) {
        console.error(`Failed to create MP preference for ${productName}:`, e);
    }
    return undefined;
}

async function processPost(
  ctx: ActionCtx,
  post: any,
  requestId: Id<"catalog_requests">,
  handle: string
): Promise<ProcessedResult | null> {
  try {
    // 0. Check for duplicates
    const existing = await ctx.runQuery(internal.products.getProductByUrl, { igPostUrl: post.url });
    if (existing) return null;

    // 1. Text Analysis (Gemini)
    const caption = post.caption || "";
    const extracted = await extractProductDataFromCaption(caption);

    // 2. Filtering: If no price, discard
    if (!extracted || typeof extracted.price !== 'number') return null;

    const safePrice: number = extracted.price;

    // 3. SAVE IMMEDIATELY (Draft with original image)
    const initialProduct = {
      productName: extracted.productName,
      price: safePrice,
      currency: "CLP",
      size: extracted.size || undefined,
      originalImageUrl: post.displayUrl,
      processedImageUrl: undefined,
      igPostUrl: post.url,
      mercadoPagoLink: undefined,
    };

    // Save initial product to let UI render it ASAP
    const productIds = await ctx.runMutation(internal.requests.addProducts, {
      requestId: requestId,
      products: [initialProduct],
    });
    const productId = productIds[0];

    // 4. Image Processing
    const processedImageUrl = await processAndUploadProductImage(ctx, post.displayUrl, extracted.productName) || post.displayUrl;

    // 5. Generate Mercado Pago Preference
    const mercadoPagoLink = await createMPLink(ctx, handle, extracted.productName, safePrice, processedImageUrl);

    // 6. Update with processed image and MP link
    if (productId) {
        await ctx.runMutation(internal.products.updateProduct, {
            id: productId,
            processedImageUrl,
            mercadoPagoLink,
        });
    }

    return {
        ...initialProduct,
        processedImageUrl,
        mercadoPagoLink,
    };
  } catch (error) {
    console.error(`Failed to process post ${post.id}:`, error);
    return null;
  }
}

export const ingestInstagramPosts = internalAction({
  args: {
    requestId: v.id("catalog_requests"),
    posts: v.array(v.any()), // Raw Apify post objects
  },
  handler: async (ctx, args) => {
    console.log(`Processing ${args.posts.length} posts for request ${args.requestId}`);
    
    const request: Doc<"catalog_requests"> | null = await ctx.runQuery(internal.requests.getRequest, { id: args.requestId });
    if (!request) throw new Error("Request not found");
    const handle = request.handle;

    await ctx.runMutation(internal.requests.updateStatus, {
      requestId: args.requestId,
      status: "processing",
    });

    const results: ProcessedResult[] = [];

    try {
        for (let i = 0; i < args.posts.length; i += BATCH_SIZE) {
            const batch = args.posts.slice(i, i + BATCH_SIZE);
            
            const batchResults = await Promise.all(
                batch.map(post => processPost(ctx, post, args.requestId, handle))
            );
            
            results.push(...batchResults.filter((r): r is ProcessedResult => r !== null));
        }
        
        await ctx.runMutation(internal.requests.updateStatus, {
          requestId: args.requestId,
          status: "completed",
        });

        console.log("Valid products saved:", results.length);
        return { processed: results.length, valid: results };

    } catch (error) {
        console.error("Workflow failed:", error);
        await ctx.runMutation(internal.requests.updateStatus, {
          requestId: args.requestId,
          status: "failed",
        });
        throw error;
    }
  },
});
