"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// This should be YOUR Production Access Token (Integrator Token)
// Found in: Mercado Pago Developers -> Your Application -> Production Credentials -> Access Token
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN!; 

/**
 * Creates a Test User in Mercado Pago associated with your application.
 * This is useful for generating "Buyer" or "Seller" accounts for testing.
 */
export const createTestUser = action({
  args: {
    siteId: v.string(), // e.g. "MLA", "MLC", etc.
    description: v.string(), // e.g. "Test Seller for Vitrina"
  },
  handler: async (ctx, args) => {
    if (!MP_ACCESS_TOKEN) {
      throw new Error("Missing MERCADO_PAGO_ACCESS_TOKEN env var.");
    }

    const response = await fetch("https://api.mercadopago.com/users/test_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        site_id: args.siteId,
        description: args.description
      })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create test user: ${err}`);
    }

    const data = await response.json();
    // data contains: id, nickname, password, site_status, email
    
    console.log("Created Test User:", data);
    return data;
  }
});
