import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const injectTestMerchant = internalMutation({
    args: { 
        handle: v.string(),
        accessToken: v.string()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("merchants")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                accessToken: args.accessToken,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("merchants", {
                handle: args.handle,
                mpUserId: "test_user_id", // Dummy
                accessToken: args.accessToken,
                refreshToken: "dummy_refresh_token", // Dummy
                expiresIn: 3600,
                updatedAt: Date.now(),
            });
        }
        return "Inserted/Updated test merchant";
    }
});

