import { query } from "./_generated/server";

export const getProducts = query({
  handler: async (ctx) => {
    // Fetch all products, most recent first
    const products = await ctx.db.query("products").order("desc").take(20);
    return products;
  },
});

