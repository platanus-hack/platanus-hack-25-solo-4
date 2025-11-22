"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { traceable } from "langsmith/traceable";
import { internal } from "../_generated/api";
import { REMOVE_BACKGROUND_PROMPT } from "../prompts";
import type { ActionCtx } from "../_generated/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const processImageWithGemini = traceable(async (arrayBuffer: ArrayBuffer, contentType: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    const imagePart = {
        inlineData: {
            data: Buffer.from(arrayBuffer).toString("base64"),
            mimeType: contentType,
        },
    };
    
    const result = await model.generateContent([REMOVE_BACKGROUND_PROMPT, imagePart]);
    
    console.log("Nano Banana response received.");
    
    const response = result.response;
    const candidates = response.candidates;
    
    if (candidates && candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        const generatedImagePart = candidates[0].content.parts.find(part => part.inlineData);
        
        if (generatedImagePart && generatedImagePart.inlineData) {
            console.log("Found generated image in response.");
            const base64Data = generatedImagePart.inlineData.data;
            const mimeType = generatedImagePart.inlineData.mimeType || "image/png";
            const buffer = Buffer.from(base64Data, "base64");
            return new Blob([buffer], { type: mimeType });
        }
    }
    return null;
}, { name: "processImageWithGemini" });

export async function processAndUploadProductImage(ctx: ActionCtx, imageUrl: string, productName: string): Promise<string | null> {
  try {
    console.log(`Processing image for ${productName}...`);

    // 1. Fetch the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    let imageBlob: Blob;

    try {
        // 2. Process with Gemini 2.5 Flash Image (Nano Banana)
        const processedBlob = await processImageWithGemini(arrayBuffer, contentType);
        
        if (processedBlob) {
             imageBlob = processedBlob;
        } else {
             console.warn("No image data found in Gemini response or invalid structure. Falling back to original image.");
             imageBlob = new Blob([arrayBuffer], { type: contentType });
        }

    } catch (e) {
        console.log("Nano Banana processing skipped/failed, using original:", e);
        imageBlob = new Blob([arrayBuffer], { type: contentType });
    }

    // 3. Generate Upload URL via internal mutation
    const uploadUrl = await ctx.runMutation(internal.files.generateUploadUrl);

    // 4. Upload to Convex Storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": imageBlob.type },
      body: imageBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();
    const publicUrl = await ctx.runQuery(internal.files.getUrl, { storageId });

    return publicUrl;
  } catch (error) {
    console.error("Image processing failed:", error);
    return imageUrl;
  }
}
