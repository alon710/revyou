import mustache from "mustache";
import { generateWithGemini } from "./core/gemini-client";
import { WEEKLY_SUMMARY_PROMPT } from "./prompts/weekly-summary-template";
import type { Review } from "@/lib/db/schema";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

export interface WeeklySummaryData {
  positiveThemes: string[];
  negativeThemes: string[];
  recommendations: string[];
}

const summarySchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    positiveThemes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of positive themes identified in the reviews",
    },
    negativeThemes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of negative themes or areas for improvement",
    },
    recommendations: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of actionable recommendations based on the reviews",
    },
  },
  required: ["positiveThemes", "negativeThemes", "recommendations"],
};

export async function generateWeeklySummary(
  businessName: string,
  reviews: Review[],
  language: "en" | "he" = "en"
): Promise<WeeklySummaryData> {
  if (reviews.length === 0) {
    return {
      positiveThemes: [],
      negativeThemes: [],
      recommendations: [],
    };
  }

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

  const reviewsList = reviews.map((r) => ({
    rating: r.rating,
    text: r.text || "(No text)",
    date: r.date.toISOString().split("T")[0],
  }));

  const prompt = mustache.render(WEEKLY_SUMMARY_PROMPT, {
    businessName,
    totalReviews,
    averageRating: averageRating.toFixed(1),
    language: language === "he" ? "Hebrew" : "English",
    reviews: JSON.stringify(reviewsList, null, 2),
  });

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY");

    const response = await generateWithGemini(key, prompt, "gemini-3-pro-preview", 8192, summarySchema);

    const data = JSON.parse(response) as WeeklySummaryData;

    return {
      positiveThemes: data.positiveThemes || [],
      negativeThemes: data.negativeThemes || [],
      recommendations: data.recommendations || [],
    };
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return {
      positiveThemes: [],
      negativeThemes: [],
      recommendations: ["Could not generate recommendations at this time due to an error."],
    };
  }
}
