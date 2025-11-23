# Vitrina

Turn any Instagram feed into an instant e-commerce catalog.

## About

Vitrina is a tool that takes an Instagram handle (like `@nikestore`), scrapes the latest posts, and uses AI to convert them into buyable products.

1.  **Scrape:** We fetch the latest images and captions from Instagram.
2.  **Analyze:** Gemini 3 Pro reads the caption to find the product name and price.
3.  **Enhance:** We remove the background from the image for a clean studio look.
4.  **Sell:** A payment link (Mercado Pago) is automatically generated for each item.

## Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Convex (Serverless)
*   **AI:** Gemini 3 Pro (Text), Google Nano Banana (Image)
*   **Scraping:** Apify
*   **Payments:** Mercado Pago

## Getting Started

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Run the backend (Convex)**
    ```bash
    npx convex dev
    ```

3.  **Run the frontend**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:5173](http://localhost:5173) to see the app.

## Environment Variables

You will need to set up the following secrets in your Convex dashboard. Check `env.template` to see all required variables.

*   `APIFY_API_TOKEN`
*   `GOOGLE_API_KEY` (for Gemini)
*   `MERCADO_PAGO_ACCESS_TOKEN`
*   `CONVEX_DEPLOYMENT_KEY` (for Vercel)
*   `VITE_CONVEX_URL`