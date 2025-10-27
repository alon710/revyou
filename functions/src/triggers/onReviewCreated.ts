import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

const db = admin.firestore();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Get language instruction based on mode
 */
function getLanguageInstruction(languageMode: string): string {
  const instructions: Record<string, string> = {
    hebrew: "עברית בלבד. אין לשלב שפות אחרות בתשובה.",
    english: "English only. Do not mix other languages in the response.",
    "auto-detect": "זהה אוטומטית את שפת הביקורת והשב באותה שפה.",
    "match-reviewer": "התאם את שפת התגובה לשפה שבה כתב המבקר.",
  };
  return instructions[languageMode] || instructions.hebrew;
}

/**
 * Helper function to build AI prompt
 */
function buildPrompt(
  businessName: string,
  businessDescription: string,
  rating: number,
  reviewerName: string,
  reviewText: string,
  toneOfVoice: string,
  useEmojis: boolean,
  maxSentences: number,
  signature: string,
  languageMode: string,
  businessPhone?: string,
  customInstructions?: string,
  allowedEmojis?: string[]
): string {
  const languageInstruction = getLanguageInstruction(languageMode);

  const emojiInstructions = useEmojis
    ? `מותרים אך מושתתים על הטון. ${allowedEmojis && allowedEmojis.length > 0 ? `רשימה מותרת: ${allowedEmojis.join(" ")}` : ""}`
    : "אסור להשתמש באימוג'ים.";

  return `אתה מודל AI שתפקידו לענות על ביקורות גוגל של ${businessName}.

על העסק:
${businessDescription}

הוראות:
- שפה: ${languageInstruction}
- אורך: ${maxSentences} משפטים בלבד מקסימום
- פתיחה: כל תגובה חייבת להתחיל בפנייה אישית לשם המבקר. תרגם את שם המבקר לשפת התגובה באופן פונטי/מקובל (לדוגמא: John→ג'ון, Sarah→שרה בעברית)
- טון: ${toneOfVoice}
- אימוג'ים: ${emojiInstructions}
- חתימה: ${signature}
${businessPhone ? `- טלפון ליצירת קשר: ${businessPhone}` : ""}

כללי תוכן:
- דירוג 5-4 (חיובי): הבע תודה חמה וכללית בלבד. אסור להתייחס לפרטים ספציפיים.
- דירוג 3 (ניטרלי): הבע הערכה, הראה רצון לשיפור, בקש פרטים.
${businessPhone ? `- דירוג 1-2 (שלילי): התנצלות כנה + בקש ליצור קשר בטלפון: ${businessPhone}` : "- דירוג 1-2 (שלילי): התנצלות כנה והבע רצון לתקן."}

${customInstructions ? `הנחיות נוספות לדירוג ${rating}:\n${customInstructions}\n` : ""}

הביקורת לתשובה:
דירוג: ${rating}/5
שם המבקר: ${reviewerName}
טקסט: ${reviewText || "(אין טקסט)"}

צור תגובה קצרה (${maxSentences} משפטים) שמתחילה בפנייה אישית לשם המבקר ומסתיימת ב-${signature}.

חשוב: אין צורך לכלול שם מלא בתגובה - שם פרטי זה מספיק. שים לב למספר המשפטים ולדקדוק (לדוגמא: "שמחנו לשמוע שהייתה לכם חוויה נהדרת" ולא "שמחנו לשמוע שהיה לכם חוויה נהדרת").`;
}

/**
 * Firestore trigger: Generate AI reply when new review is created
 */
export const onReviewCreated = functions.onDocumentCreated(
  "users/{userId}/locations/{businessId}/reviews/{reviewId}",
  async (event) => {
    try {
      const reviewData = event.data?.data();
      const reviewId = event.params.reviewId;
      const businessId = event.params.businessId;
      const userId = event.params.userId;

      if (!reviewData) {
        logger.warn("No review data");
        return;
      }

      logger.info(
        `Processing new review: ${reviewId} for location ${businessId} user ${userId}`
      );

      const businessDoc = await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .get();

      if (!businessDoc.exists) {
        logger.error(`Business ${businessId} not found for user ${userId}`);
        return;
      }

      const location = businessDoc.data();
      const config = location?.config;

      if (!config) {
        logger.error("Business config not found");
        return;
      }

      const starConfig = config.starConfigs?.[reviewData.rating];
      if (!starConfig || !starConfig.autoReply) {
        logger.info(`Auto-reply disabled for ${reviewData.rating} stars`);
        await db
          .collection("users")
          .doc(userId)
          .collection("locations")
          .doc(businessId)
          .collection("reviews")
          .doc(reviewId)
          .update({
            replyStatus: "skipped",
          });
        return;
      }

      const prompt = buildPrompt(
        location.name,
        config.businessDescription,
        reviewData.rating,
        reviewData.reviewerName,
        reviewData.reviewText,
        config.toneOfVoice || "friendly",
        config.useEmojis || false,
        config.maxSentences || 2,
        config.signature || `צוות ${location.name}`,
        config.languageMode || "hebrew",
        config.businessPhone,
        starConfig.customInstructions,
        config.allowedEmojis
      );

      logger.info("Generated prompt for Gemini");

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 500,
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const aiReply = result.response.text().trim();

      logger.info(`Generated AI reply: ${aiReply}`);

      const replyStatus = "approved" as const;
      logger.info(
        `Auto-reply enabled for ${reviewData.rating} stars, marking as approved`
      );

      await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .collection("reviews")
        .doc(reviewId)
        .update({
          aiReply,
          aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
          replyStatus,
        });

      logger.info(`Updated review ${reviewId} with AI reply`);
    } catch (error) {
      logger.error("Error generating AI reply:", error);

      try {
        await db
          .collection("users")
          .doc(event.params.userId)
          .collection("locations")
          .doc(event.params.businessId)
          .collection("reviews")
          .doc(event.params.reviewId)
          .update({
            replyStatus: "failed",
          });
      } catch (updateError) {
        logger.error("Error updating review status to failed:", updateError);
      }
    }
  }
);
