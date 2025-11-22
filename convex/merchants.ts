import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getMerchant = internalQuery({
    args: { handle: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("merchants")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();
    }
});

export const getDefaultMerchant = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("merchants").first();
    }
});

export const saveMerchant = internalMutation({
    args: {
        handle: v.string(),
        mpUserId: v.string(),
        accessToken: v.string(),
        refreshToken: v.string(),
        expiresIn: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("merchants")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                mpUserId: args.mpUserId,
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresIn: args.expiresIn,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("merchants", {
                handle: args.handle,
                mpUserId: args.mpUserId,
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresIn: args.expiresIn,
                updatedAt: Date.now(),
            });
        }
    }
});

