import { z } from "zod";
import { Timestamp } from "firebase/firestore";

const timestampSchema = z.custom<Timestamp>((val) => val instanceof Timestamp, {
  message: "Must be a Firestore Timestamp",
});

const toneOfVoiceSchema = z.enum([
  "friendly",
  "formal",
  "humorous",
  "professional",
]);
const languageModeSchema = z.enum(["hebrew", "english", "auto-detect"]);
const replyStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "posted",
  "failed",
]);

const starConfigSchema = z.object({
  customInstructions: z.string().max(1000).default(""),
  autoReply: z.boolean(),
});

export const locationConfigSchema = z.object({
  businessName: z.string().max(200).optional(),
  businessDescription: z.string().max(2000).default(""),
  businessPhone: z.string().max(50).optional(),

  toneOfVoice: toneOfVoiceSchema,
  useEmojis: z.boolean(),
  languageMode: languageModeSchema,
  languageInstructions: z.string().max(100).optional(),
  maxSentences: z.number().min(1).max(5).optional().default(2),
  allowedEmojis: z.array(z.string()).optional().default([]),
  signature: z.string().max(100).optional().default(""),

  starConfigs: z.object({
    1: starConfigSchema,
    2: starConfigSchema,
    3: starConfigSchema,
    4: starConfigSchema,
    5: starConfigSchema,
  }),
});

export const locationSchema = z.object({
  id: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleLocationId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  photoUrl: z.string().url().optional(),
  connected: z.boolean(),
  connectedAt: timestampSchema,
  config: locationConfigSchema,
  emailOnNewReview: z.boolean(),
});

export const locationCreateSchema = locationSchema.omit({ id: true });

export const locationUpdateSchema = locationSchema
  .partial()
  .omit({ id: true, connectedAt: true });

export const reviewSchema = z.object({
  id: z.string().min(1),
  googleReviewId: z.string().min(1),
  reviewerName: z.string().min(1).max(200),
  reviewerPhotoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(5000),
  reviewDate: timestampSchema,
  receivedAt: timestampSchema,
  aiReply: z.string().max(2000).optional(),
  aiReplyGeneratedAt: timestampSchema.optional(),
  replyStatus: replyStatusSchema,
  postedReply: z.string().max(2000).nullable().optional(),
  postedAt: timestampSchema.nullable().optional(),
  postedBy: z.string().nullable().optional(),
  wasEdited: z.boolean(),
  editedReply: z.string().max(2000).nullable().optional(),
});
