import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

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
  createdAt: timestampSchemaAdmin,
  stripeId: z.string().optional(),
  stripeLink: z.string().url().optional(),
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
  googleBusinessId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  phoneNumber: z.string().max(50).nullable(),
  websiteUrl: z
    .string()
    .url()
    .max(200)
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  mapsUrl: z
    .string()
    .url()
    .max(2000)
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  description: z.string().max(5000).nullable(),
  photoUrl: z
    .string()
    .url()
    .max(2000)
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  connected: z.boolean(),
  connectedAt: timestampSchemaAdmin,
  config: BusinessConfigSchema,
  emailOnNewReview: z.boolean(),
});

export const reviewSchemaAdmin = z.object({
  id: z.string().min(1),
  googleReviewId: z.string().min(1),
  googleReviewName: z.string().optional(), // Full Google resource path
  name: z.string().min(1).max(200),
  photoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(5000).optional(),
  date: timestampSchemaAdmin,
  receivedAt: timestampSchemaAdmin,
  updateTime: timestampSchemaAdmin.optional(),
  isAnonymous: z.boolean().optional(),
  aiReply: z.string().max(2000).optional(),
  aiReplyGeneratedAt: timestampSchemaAdmin.optional(),
  replyStatus: replyStatusSchema,
  postedReply: z.string().max(2000).nullable().optional(),
  postedAt: timestampSchemaAdmin.nullable().optional(),
  postedBy: z.string().nullable().optional(),
});

export const accountSchemaAdmin = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  accountName: z.string().min(1).max(200),
  googleRefreshToken: z.string().min(1),
  connectedAt: timestampSchemaAdmin,
  lastSynced: timestampSchemaAdmin.optional(),
  googleAccountName: z.string().optional(),
});
