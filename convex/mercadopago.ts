"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Env vars should be set in Convex dashboard
const MP_APP_ID = process.env.MP_APP_ID!;
const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET!;
const MP_REDIRECT_URI = process.env.MP_REDIRECT_URI!;

/**
 * Generates the Mercado Pago OAuth URL for sellers to connect their accounts.
 */
export const getAuthUrl = action({
  args: {
    handle: v.string(), // Pass the handle to state so we know who connected
  },
  handler: async (ctx, args) => {
    if (!MP_APP_ID || !MP_REDIRECT_URI) {
      throw new Error("Missing MP_APP_ID or MP_REDIRECT_URI env vars");
    }
    
    // State param can carry the handle to identify the user on return
    const state = args.handle;
    
    const url = `https://auth.mercadopago.com/authorization?client_id=${MP_APP_ID}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${encodeURIComponent(MP_REDIRECT_URI)}`;
    
    return url;
  },
});

/**
 * Internal action to exchange the authorization code for an access token.
 */
export const exchangeCode = internalAction({
  args: {
    code: v.string(),
    handle: v.string(),
  },
  handler: async (ctx, args) => {
    if (!MP_CLIENT_SECRET || !MP_REDIRECT_URI || !MP_APP_ID) {
        throw new Error("Missing MP config");
    }

    // Using fetch directly for OAuth exchange to ensure control over parameters
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_secret: MP_CLIENT_SECRET,
        client_id: MP_APP_ID,
        grant_type: "authorization_code",
        code: args.code,
        redirect_uri: MP_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("MP OAuth Error:", err);
        throw new Error("Failed to exchange code");
    }

    const data = await response.json();
    
    // data contains: access_token, refresh_token, public_key, live_mode, user_id, expires_in
    
    await ctx.runMutation(internal.merchants.saveMerchant, {
        handle: args.handle,
        mpUserId: String(data.user_id),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    });
    
    return data;
  },
});

/**
 * Create a preference for a product.
 * This handles the "Marketplace" logic: using the Seller's Access Token to create the preference,
 * optionally taking a marketplace fee (if we were configured to do so, but simple implementation first).
 */
export const createPreference = internalAction({
    args: {
        handle: v.string(),
        title: v.string(),
        price: v.number(),
        imageUrl: v.string(),
        currency: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Get the merchant
        const merchant = await ctx.runQuery(internal.merchants.getMerchant, { handle: args.handle });
        
        let client: MercadoPagoConfig;
        let marketplaceFee = 0; // Set your fee here if needed
        
        if (merchant) {
            console.log(`Creating preference for merchant: ${args.handle}`);
            // Initialize with SELLER'S access token
            client = new MercadoPagoConfig({ accessToken: merchant.accessToken });
        } else {
            console.warn(`No merchant found for ${args.handle}. Cannot create preference.`);
            return null;
        }

        const preference = new Preference(client);
        
        try {
            const result = await preference.create({
                body: {
                    items: [
                        {
                            id: "product-1", // In real app, pass ID
                            title: args.title,
                            unit_price: args.price,
                            quantity: 1,
                            picture_url: args.imageUrl,
                            currency_id: args.currency || "ARS", 
                        }
                    ],
                    back_urls: {
                        success: "https://www.google.com", // Replace with actual
                        failure: "https://www.google.com",
                        pending: "https://www.google.com"
                    },
                    auto_return: "approved",
                    marketplace_fee: marketplaceFee, 
                    // notification_url: "..." // Webhook URL
                }
            });
            
            return result.init_point; // or sandbox_init_point
        } catch (error) {
            console.error("Error creating preference:", error);
            // Re-throw the error so we can see it in the CLI output
            throw new Error(`MP API Error: ${error}`);
        }
    }
});

/**
 * Manually regenerate a link for a product.
 * Useful for testing or if the initial generation failed.
 */
export const regenerateLinkForProduct = action({
    args: { productId: v.id("products") },
    handler: async (ctx, args): Promise<string | null> => {
        // 1. Get Product
        const product: Doc<"products"> | null = await ctx.runQuery(api.products.getProduct, { id: args.productId });
        if (!product) throw new Error("Product not found");
        
        // 2. Get Request (to find handle)
        if (!product.requestId) throw new Error("Product has no request ID");
        const request: Doc<"catalog_requests"> | null = await ctx.runQuery(internal.requests.getRequest, { id: product.requestId });
        if (!request) throw new Error("Request not found");

        // 3. Create Preference
        // We need to ensure price and name exist
        if (!product.price || !product.productName) {
            throw new Error("Product missing price or name");
        }
        
        const link: string | null = await ctx.runAction(internal.mercadopago.createPreference, {
            handle: request.handle,
            title: product.productName,
            price: product.price,
            imageUrl: product.processedImageUrl || product.originalImageUrl,
            currency: product.currency || undefined,
        });

        if (!link) {
            throw new Error("Failed to generate link (maybe merchant not connected?)");
        }

        // 4. Update Product
        await ctx.runMutation(internal.products.updateProductLink, {
            id: args.productId,
            mercadoPagoLink: link,
        });

        return link;
    }
});
