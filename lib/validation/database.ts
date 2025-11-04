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
export const subscriptionTierSchema = z.enum(["free", "basic", "pro"]);

export const userSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1).max(200),
  photoURL: z.string().url(),
  subscriptionTier: subscriptionTierSchema,
  createdAt: timestampSchema,
  stripeCustomerId: z.string().optional(),
  googleRefreshToken: z.string().optional(),
  selectedBusinessId: z.string().optional(),
});

const starConfigSchema = z.object({
  customInstructions: z.string().max(1000).default(""),
  autoReply: z.boolean(),
});

export const BusinessConfigSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(2000).optional(),
  phoneNumber: z.string().max(50).optional(),

  toneOfVoice: toneOfVoiceSchema,
  useEmojis: z.boolean(),
  languageMode: languageModeSchema,
  languageInstructions: z.string().max(100).optional(),
  maxSentences: z.number().min(1).max(5).optional().default(2),
  allowedEmojis: z.array(z.string()).max(50).optional().default([]),
  signature: z.string().max(100).optional().default(""),

  starConfigs: z.object({
    1: starConfigSchema,
    2: starConfigSchema,
    3: starConfigSchema,
    4: starConfigSchema,
    5: starConfigSchema,
  }),
});

export const businessSchema = z.object({
  id: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleBusinessId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  phoneNumber: z.string().max(50).optional(),
  websiteUrl: z.string().url().max(200).optional(),
  mapsUrl: z.string().url().max(2000).optional(),
  description: z.string().max(5000).optional(),
  photoUrl: z.string().url().max(2000).optional(),
  connected: z.boolean(),
  connectedAt: timestampSchema,
  config: BusinessConfigSchema,
  emailOnNewReview: z.boolean(),
});

export const businessCreateSchema = businessSchema.omit({ id: true });

export const businessUpdateSchema = businessSchema
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
});

export type BusinessCreateInput = z.infer<typeof businessCreateSchema>;
export type BusinessUpdateInput = z.infer<typeof businessUpdateSchema>;
