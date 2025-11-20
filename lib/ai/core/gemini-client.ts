import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateWithGemini(
  apiKey: string,
  prompt: string,
  modelName: string = "gemini-2.5-flash",
  maxOutputTokens: number = 8192
): Promise<string> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens,
    },
  });

  return result.response.text().trim();
}
