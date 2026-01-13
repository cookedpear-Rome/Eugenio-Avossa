
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const removeTextFromImage = async (imageData: ImageData): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure it is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Use gemini-2.5-flash-image for image editing tasks
  const modelName = 'gemini-2.5-flash-image';
  
  const prompt = "Please remove the text 'KPOP DEMON HUNTERS' from the bottom of this image. Reconstruct the background behind the text so it looks seamless and natural, matching the existing gradient and curved line patterns.";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData.base64.split(',')[1], // Remove the data:image/png;base64, prefix
              mimeType: imageData.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from model.");
    }

    let resultImageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        resultImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!resultImageUrl) {
      // Sometimes the model might return text instead of an image if it fails to edit
      if (response.text) {
        throw new Error(`Model response: ${response.text}`);
      }
      throw new Error("Failed to generate an edited image.");
    }

    return resultImageUrl;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An unexpected error occurred while processing the image.");
  }
};
