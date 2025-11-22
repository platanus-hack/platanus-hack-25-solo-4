# Project Spec: Vitrina

## 1. Core Objective
A platform that converts an Instagram feed into an e-commerce catalog.
User inputs a handle -> System scrapes posts -> LLM extracts product/price -> AI removes background -> User sees a catalog -> User clicks "Buy Now" (Mercado Pago).

## 2. Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS (Vite).
- **Backend/DB:** Convex (Serverless functions & Database).
- **Hosting/Deploy:** Vercel (Frontend) + Convex Cloud (Backend).
- **Scraping:** Apify (Instagram Scraper Actor).
- **Intelligence:**
    - **Text:** Gemini 3 Pro (Extract product name & price from caption).
    - **Image:** Google Nano Banana (Remove background, adjust luminosity, pure white background).
- **Payments:** Mercado Pago (Simple payment link generation).

## 3. Data Models (Convex Schema)

### `catalog_requests`
- `handle` (string): The IG handle requested.
- `status` (string): "pending" | "processing" | "completed" | "failed".
- `requestTime` (number): Timestamp.

### `products`
- `requestId` (id): Link to the request.
- `originalImageUrl` (string): From Instagram.
- `processedImageUrl` (string): Result from Nano Banana (White BG).
- `productName` (string): Extracted by Gemini.
- `price` (number): Extracted by Gemini.
- `size` (string): Extracted by Gemini.
- `igPostUrl` (string): Deep link back to the post.
- `mercadoPagoLink` (string): Generated payment link.

## 4. Business Logic Rules
1.  **Input:** User types a handle (e.g., "@nikestore"). No OAUTH/Login required.
2.  **Filtering:** If Gemini cannot find a generic price in the caption, **discard the item**. Do not guess.
3.  **Image Processing:** All images must be processed to have a **pure white background** using the Nano Banana model.
4.  **Checkout:** "Buy Now" button links directly to a Mercado Pago Preference. No cart.

## 5. Development Plan (Step-by-Step)
*Do not generate code for future steps until the current step is verified.*

**Phase 1: Setup & Scraper**
1.  Initialize Vite + React + Tailwind project.
2.  Initialize Convex.
3.  Create `catalog_requests` schema and a mutation to save a new request.
4.  Integrate Apify SDK in a Convex Action to scrape the last 5 posts of the handle.

**Phase 2: Intelligence Pipeline**
5.  Create a Convex Internal Action that takes the Apify results.
6.  **Step A (Text):** Send captions to Gemini 3 Pro. Return JSON `{ name, price, currency }`. Filter out null prices.
7.  **Step B (Image):** Send image URLs to Nano Banana. Return new URL.
8.  Save valid results to `products` table.

**Phase 3: UI Construction**
9.  Build the Search Component (Input + Button). Connect to Phase 1 mutation.
10. Build the Product Grid (Card component with Image, Title, Price).
11. Implement "Real-time" updates (Convex useQuery) to show products as they appear.

**Phase 4: Payments**
12. Integrate Mercado Pago SDK in a Convex Action to generate a preference link when the product is created.
13. Bind the link to the "Buy Now" button.

**Phase 5: Deployment (Vercel)**
14. Configure `package.json` build script to: `npx convex deploy --cmd 'npm run build'`.
15. Verify `CONVEX_DEPLOY_KEY` environment variable handling.