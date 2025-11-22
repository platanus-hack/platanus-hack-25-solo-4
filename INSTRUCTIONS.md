# Mercado Pago Marketplace Integration

This integration allows Instagram handle owners (Sellers) to connect their Mercado Pago accounts to Vitrina. When a catalog is generated for their handle, the "Buy Now" buttons will link to a Mercado Pago Preference created on their behalf.

## Configuration Steps

### 1. Mercado Pago Developers Dashboard

1.  Go to [Mercado Pago Developers](https://www.mercadopago.com/developers/panel).
2.  Create a new Application (Marketplace type).
3.  In "Authentication & Security", copy the `App ID` and `Client Secret`.
4.  In "Production Credentials" or "Test Credentials", find your Access Token (if needed for platform operations, though we mainly use Seller tokens).
5.  **Configure Redirect URI**:
    *   Add the following URL to your application's allowed Redirect URIs:
    *   `https://<YOUR_CONVEX_SITE_URL>/mercadopago/callback`
    *   (You can find your Convex Site URL in the Convex Dashboard under Settings > URL & Keys, or by running `npx convex env`). It usually looks like `https://happy-otter-123.convex.site`.

### 2. Convex Environment Variables

Set the following environment variables in your Convex Dashboard (or `.env.local` for development):

```bash
MP_APP_ID=your_app_id
MP_CLIENT_SECRET=your_client_secret
MP_REDIRECT_URI=https://<YOUR_CONVEX_SITE_URL>/mercadopago/callback
```

To set them via command line:

```bash
npx convex env set MP_APP_ID "..."
npx convex env set MP_CLIENT_SECRET "..."
npx convex env set MP_REDIRECT_URI "..."
```

## How it Works

1.  **Seller Onboarding**:
    *   Users click "For Sellers" in the header.
    *   They enter their Instagram handle and click "Connect Mercado Pago".
    *   They are redirected to Mercado Pago to authorize your application.
    *   Upon success, their Access Token is encrypted and stored in the `merchants` table in Convex, linked to their handle.

2.  **Product Ingestion**:
    *   When a user searches for a handle (e.g., `@nikestore`), the system scrapes the posts.
    *   During processing, the system checks if `@nikestore` has a connected Merchant account in Vitrina.
    *   **If connected**: It uses the Seller's Access Token to create a Mercado Pago Preference for each product.
    *   **If not connected**: The "Buy Now" link will not be generated (or you can configure a fallback).

3.  **Checkout**:
    *   Buyers see a "Buy with Mercado Pago" button on the product detail page.
    *   Clicking it takes them to the Mercado Pago checkout.
    *   Funds go directly to the Seller's account.

## Future Improvements

*   **Marketplace Fee**: To take a cut of the sales, update `convex/mercadopago.ts` -> `createPreference` to set `marketplace_fee`.
*   **Webhooks**: Configure Webhooks in Mercado Pago to listen for payment status updates (handled in `convex/http.ts`).

