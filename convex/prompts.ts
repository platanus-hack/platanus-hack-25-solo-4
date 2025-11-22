export const EXTRACT_PRODUCT_INFO_PROMPT = `
  You are an expert e-commerce data extractor. Analyze this Instagram caption and extract:
  - Product Name (short, descriptive)
  - Price (numeric value only)
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

