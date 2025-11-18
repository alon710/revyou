import { generateWithGemini } from "./core/gemini-client";
import { serverEnv } from "@/lib/env";

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    return await generateWithGemini(serverEnv.GEMINI_API_KEY, prompt);
  } catch (error) {
    throw error;
  }
}
