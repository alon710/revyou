import { generateWithGemini } from "./core/gemini-client";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY as string;

    return await generateWithGemini(apiKey, prompt, {
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 500,
    });
  } catch (error) {
    console.error("Error generating reply with Gemini", error);
    throw error;
  }
}
