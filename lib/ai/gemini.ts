import { generateWithGemini } from "./core/gemini-client";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY as string;
    return await generateWithGemini(apiKey, prompt);
  } catch (error) {
    throw error;
  }
}
