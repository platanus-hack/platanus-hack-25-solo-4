export const EXTRACT_PRODUCT_INFO_PROMPT = `
  You are an expert e-commerce data extractor. Analyze this Instagram caption and extract:
  - Product Name (short, descriptive). Normalize brand names if they appear obfuscated (e.g., "ni.ke" -> "Nike", "po.lo" -> "Polo"). Remove special characters used to bypass filters.
  - Price (numeric value only). Prices in Chile are often abbreviated. If a price is a small number (e.g., < 1000) and likely represents thousands (e.g., "5" meaning 5.000 CLP), multiply it by 1000 to get the full value.
  - Size (if available)

  Return ONLY valid JSON matching this schema:
  {
    "productName": "string",
    "price": number | null,
    "size": "string | null"
  }
  
  If the price is missing or ambiguous, set "price": null.
  Do not guess.
`;

export const REMOVE_BACKGROUND_PROMPT = "Remove the background of this product image and place it on a pure white background. Return the image in PNG format.";

