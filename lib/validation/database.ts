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
const replyStatusSchema = z.enum(["pending", "rejected", "posted", "failed"]);

const starConfigSchema = z.object({
  customInstructions: z.string().max(1000).default(""),
  autoReply: z.boolean(),
});

export const locationConfigSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(2000).optional(),
  phoneNumber: z.string().max(50).optional(),

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
  phoneNumber: z.string().max(50).optional(),
  websiteUrl: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  description: z.string().max(5000).optional(),
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
  name: z.string().min(1).max(200),
  photoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(5000).optional(),
  date: timestampSchema,
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

export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
