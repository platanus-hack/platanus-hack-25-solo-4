"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { internal } from "../_generated/api";
import { REMOVE_BACKGROUND_PROMPT } from "../prompts";
import { ActionCtx } from "../_generated/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        
        const imagePart = {
            inlineData: {
                data: Buffer.from(arrayBuffer).toString("base64"),
                mimeType: contentType,
            },
        };
        
        const result = await model.generateContent([REMOVE_BACKGROUND_PROMPT, imagePart]);
        const response = await result.response;
        
        console.log("Nano Banana response received.");
        
        // TODO: Properly handle the processed image from Gemini if/when it returns the image data directly.
        // Currently using the original image as fallback/placeholder flow as the API response handling for image edits needs verification.
        imageBlob = new Blob([arrayBuffer], { type: contentType });

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

