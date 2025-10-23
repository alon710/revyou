import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Google Gemini AI Client
 * Handles AI reply generation using Gemini API
 */

// Initialize Gemini API
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

/**
 * Generate AI reply using Gemini
 * @param prompt - The prompt to send to Gemini
 * @param options - Generation options
 * @returns Generated reply text
 */
export async function generateReply(
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
      model: "gemini-2.5-flash-lite", // Fast, low-cost, optimized for short responses
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

/**
 * Generate AI reply with retry logic
 * @param prompt - The prompt to send to Gemini
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Generated reply text
 */
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

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("שגיאה ביצירת תגובה לאחר מספר ניסיונות");
}

/**
 * Validate generated reply
 * @param reply - Generated reply text
 * @param maxSentences - Maximum allowed sentences
 * @returns True if valid, false otherwise
 */
export function validateReply(
  reply: string,
  maxSentences: number = 2
): boolean {
  // Check if reply is not empty
  if (!reply || reply.trim().length === 0) {
    return false;
  }

  // Check sentence count (rough estimation)
  const sentences = reply.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > maxSentences) {
    console.warn(
      `Reply has ${sentences.length} sentences, max is ${maxSentences}`
    );
    return false;
  }

  // Check length (should be reasonable)
  if (reply.length > 1000) {
    console.warn(`Reply is too long: ${reply.length} characters`);
    return false;
  }

  return true;
}

/**
 * Test Gemini API connection
 * @returns True if connection successful
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const reply = await generateReply("אמור 'שלום'");
    return reply.length > 0;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
