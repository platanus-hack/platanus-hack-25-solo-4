import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  catalog_requests: defineTable({
    handle: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    requestTime: v.number(),
  }),
  products: defineTable({
    requestId: v.id("catalog_requests"),
    originalImageUrl: v.string(),
    processedImageUrl: v.optional(v.string()),
    productName: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    size: v.optional(v.string()),
    igPostUrl: v.string(),
    mercadoPagoLink: v.optional(v.string()),
    mercadoPagoPreferenceId: v.optional(v.string()),
    handle: v.optional(v.string()),
  }).index("by_handle", ["handle"]),
  merchants: defineTable({
    handle: v.string(),
    mpUserId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresIn: v.number(),
    updatedAt: v.number(),
  }).index("by_handle", ["handle"]),
});
