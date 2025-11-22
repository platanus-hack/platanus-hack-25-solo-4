import { mutation, internalMutation, internalQuery, query } from "./_generated/server";
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

export const getRequestStatus = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("catalog_requests")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .order("desc")
      .first();
    return request ? { status: request.status, timestamp: request.requestTime } : null;
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
    const request = await ctx.db.get(args.requestId);
    if (!request) {
        throw new Error("Request not found");
    }

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
        handle: request.handle,
      });
    }
  },
});

export const updateStatus = internalMutation({
  args: {
    requestId: v.id("catalog_requests"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
    });
  },
});
