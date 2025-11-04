import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { subscriptionTierSchema } from "@/lib/validation/database";

const timestampSchemaAdmin = z.custom<Timestamp | Date>(
  (val) =>
    val instanceof Timestamp ||
    val instanceof Date ||
    val === null ||
    val === undefined,
  {
    message: "Must be a Firestore Admin Timestamp or Date object",
  }
);

const toneOfVoiceSchema = z.enum([
  "friendly",
  "formal",
  "humorous",
  "professional",
]);

const languageModeSchema = z.enum(["hebrew", "english", "auto-detect"]);

const replyStatusSchema = z.enum(["pending", "rejected", "posted", "failed"]);

export const userSchemaAdmin = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1).max(200),
  photoURL: z
    .string()
    .url()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  subscriptionTier: subscriptionTierSchema,
  createdAt: timestampSchemaAdmin,
  stripeCustomerId: z.string().optional(),
  googleRefreshToken: z.string().optional(),
  selectedBusinessId: z.string().optional(),
});

const starConfigSchema = z.object({
  customInstructions: z.string().max(1000).default(""),
  autoReply: z.boolean(),
});

const BusinessConfigSchema = z.object({
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

export const businessSchemaAdmin = z.object({
  id: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleBusinessId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  phoneNumber: z.string().max(50).optional(),
  websiteUrl: z
    .string()
    .url()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  mapsUrl: z
    .string()
    .url()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  description: z.string().max(5000).optional(),
  photoUrl: z
    .string()
    .url()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  connected: z.boolean(),
  connectedAt: timestampSchemaAdmin,
  config: BusinessConfigSchema,
  emailOnNewReview: z.boolean(),
});

export const reviewSchemaAdmin = z.object({
  id: z.string().min(1),
  googleReviewId: z.string().min(1),
  name: z.string().min(1).max(200),
  photoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(5000).optional(),
  date: timestampSchemaAdmin,
  receivedAt: timestampSchemaAdmin,
  aiReply: z.string().max(2000).optional(),
  aiReplyGeneratedAt: timestampSchemaAdmin.optional(),
  replyStatus: replyStatusSchema,
  postedReply: z.string().max(2000).nullable().optional(),
  postedAt: timestampSchemaAdmin.nullable().optional(),
  postedBy: z.string().nullable().optional(),
});
