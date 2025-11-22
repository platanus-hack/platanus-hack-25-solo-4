import { query } from "./_generated/server";
import { v } from "convex/values";

export const inspect = query({
  args: { requestId: v.id("catalog_requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return { error: "Request not found" };
    
    const merchant = await ctx.db.query("merchants")
        .withIndex("by_handle", (q) => q.eq("handle", request.handle))
        .first();
        
    return {
        handle: request.handle,
        merchant: merchant || "No merchant found"
    };
  },
});

