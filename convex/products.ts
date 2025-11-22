import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  handler: async (ctx) => {
    // Fetch all products, most recent first
    const products = await ctx.db.query("products").order("desc").take(20);
    return products;
  },
});

export const getProductsByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .order("desc")
      .take(20);
    return products;
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateProductLink = internalMutation({
  args: { 
    id: v.id("products"),
    mercadoPagoLink: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      mercadoPagoLink: args.mercadoPagoLink,
    });
  },
});
