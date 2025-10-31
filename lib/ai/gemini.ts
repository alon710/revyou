import { generateWithGemini } from "./core/gemini-client";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }

    return await generateWithGemini(geminiApiKey, prompt);
  } catch (error) {
    throw error;
  }
}
