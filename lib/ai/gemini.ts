import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY לא מוגדר בסביבת המערכת");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

async function generateReply(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }
): Promise<string> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const generationConfig = {
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.9,
      topK: options?.topK ?? 40,
      maxOutputTokens: options?.maxOutputTokens ?? 500,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("לא התקבלה תגובה מ-Gemini");
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating reply with Gemini:", error);
    if (error instanceof Error) {
      throw new Error(`שגיאה ביצירת תגובה אוטומטית: ${error.message}`);
    }
    throw new Error("שגיאה ביצירת תגובה אוטומטית");
  }
}

export async function generateReplyWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateReply(prompt);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed, retrying...`, error);

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("שגיאה ביצירת תגובה לאחר מספר ניסיונות");
}
