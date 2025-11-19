import { generateWithGemini } from "./core/gemini-client";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    return await generateWithGemini(process.env.GEMINI_API_KEY!, prompt);
  } catch (error) {
    throw error;
  }
}
