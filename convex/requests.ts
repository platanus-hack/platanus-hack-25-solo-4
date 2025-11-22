import { mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("catalog_requests", {
      handle: args.handle,
      status: "pending",
      requestTime: Date.now(),
    });
    return requestId;
  },
});

export const getRequest = internalQuery({
  args: { id: v.id("catalog_requests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const addProducts = internalMutation({
  args: {
    requestId: v.id("catalog_requests"),
    products: v.array(
      v.object({
        productName: v.string(),
        price: v.number(),
        currency: v.string(),
        size: v.optional(v.string()),
        originalImageUrl: v.string(),
        processedImageUrl: v.string(),
        igPostUrl: v.string(),
        mercadoPagoLink: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const product of args.products) {
      await ctx.db.insert("products", {
        requestId: args.requestId,
        productName: product.productName,
        price: product.price,
        originalImageUrl: product.originalImageUrl,
        processedImageUrl: product.processedImageUrl,
        size: product.size || undefined,
        igPostUrl: product.igPostUrl,
        mercadoPagoLink: product.mercadoPagoLink,
      });
    }

    await ctx.db.patch(args.requestId, {
      status: "completed",
    });
  },
});
