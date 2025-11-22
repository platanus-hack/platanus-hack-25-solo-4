"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { EXTRACT_PRODUCT_INFO_PROMPT } from "../prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ExtractedProductData {
  productName: string;
  price: number;
  currency: string;
  size: string | null;
}

export async function extractProductDataFromCaption(caption: string): Promise<ExtractedProductData | null> {
  if (!caption) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${EXTRACT_PRODUCT_INFO_PROMPT}

      Caption: "${caption}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString) as ExtractedProductData;
  } catch (error) {
    console.error("Gemini extraction failed:", error);
    return null;
  }
}

