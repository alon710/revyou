import { generateWithGemini } from "./core/gemini-client";
import { env } from "@/lib/env";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    return await generateWithGemini(env.GEMINI_API_KEY, prompt);
  } catch (error) {
    throw error;
  }
}
