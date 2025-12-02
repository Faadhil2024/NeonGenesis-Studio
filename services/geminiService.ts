import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { EnhancedPrompt } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Prompt Enhancement Service (Text -> JSON)
export const enhanceUserPrompt = async (rawInput: string): Promise<EnhancedPrompt> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Convert this raw image idea into a highly detailed structured image generation prompt: "${rawInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            detailed_description: { type: Type.STRING },
            artistic_style: { type: Type.STRING },
            lighting: { type: Type.STRING },
            mood: { type: Type.STRING },
            technical_details: { type: Type.STRING },
          },
          required: ["subject", "detailed_description", "artistic_style"],
        },
        systemInstruction: "You are an expert AI art curator. Your goal is to take simple user requests and expand them into rich, detailed, professional prompts suitable for high-end image generation models. Be creative but faithful to the original intent."
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from prompt enhancer");
    return JSON.parse(text) as EnhancedPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
};

// 2. Image Generation Service (Text/JSON -> Image)
// Uses gemini-2.5-flash-image (Nano Banana)
export const generateImageFromPrompt = async (promptData: EnhancedPrompt | string): Promise<string> => {
  const promptString = typeof promptData === 'string' 
    ? promptData 
    : `Create an image with the following specifications:
       Subject: ${promptData.subject}
       Description: ${promptData.detailed_description}
       Style: ${promptData.artistic_style}
       Lighting: ${promptData.lighting}
       Mood: ${promptData.mood}
       Technical: ${promptData.technical_details}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: promptString }],
      },
      config: {
        // Nano Banana specific config if needed, usually defaults are fine.
        // responseMimeType is NOT supported for images in this model.
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in the response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// 3. Image Editing Service (Image + Text -> Image)
// Uses gemini-2.5-flash-image
export const editImageWithPrompt = async (base64Image: string, instruction: string): Promise<string> => {
  // Remove data URL prefix if present for the API call
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  // Determine mime type from header or default to png
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: instruction,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image generated in the response. The model might have refused the edit or output text only.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
