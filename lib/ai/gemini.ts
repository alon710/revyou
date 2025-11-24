import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { generateWithGemini } from "./core/gemini-client";

const replySchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: {
      type: SchemaType.STRING,
      description: "The suggested reply to the review",
    },
  },
  required: ["reply"],
};

export async function generateAIReply(prompt: string): Promise<string> {
  try {
    const key = process.env.GEMINI_API_KEY!;
    const response = await generateWithGemini(key, prompt, "gemini-2.5-flash", 8192, replySchema);
    const data = JSON.parse(response) as { reply: string };
    return data.reply;
  } catch (error) {
    console.error("Error generating structured AI reply, falling back to text:", error);
    return await generateWithGemini(process.env.GEMINI_API_KEY!, prompt);
  }
}
