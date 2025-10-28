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

const replyStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "posted",
  "failed",
]);

const starConfigSchema = z.object({
  customInstructions: z.string().max(1000),
  autoReply: z.boolean(),
});

const locationConfigSchema = z.object({
  locationDescription: z.string().min(10).max(2000),
  toneOfVoice: toneOfVoiceSchema,
  useEmojis: z.boolean(),
  languageMode: languageModeSchema,
  starConfigs: z.object({
    1: starConfigSchema,
    2: starConfigSchema,
    3: starConfigSchema,
    4: starConfigSchema,
    5: starConfigSchema,
  }),
});

export const locationSchemaAdmin = z.object({
  id: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleLocationId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  photoUrl: z.string().url().optional(),
  connected: z.boolean(),
  connectedAt: timestampSchemaAdmin,
  config: locationConfigSchema,
  emailOnNewReview: z.boolean(),
});

export const reviewSchemaAdmin = z.object({
  id: z.string().min(1),
  googleReviewId: z.string().min(1),
  reviewerName: z.string().min(1).max(200),
  reviewerPhotoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(5000),
  reviewDate: timestampSchemaAdmin,
  receivedAt: timestampSchemaAdmin,
  aiReply: z.string().max(2000).optional(),
  aiReplyGeneratedAt: timestampSchemaAdmin.optional(),
  replyStatus: replyStatusSchema,
  postedReply: z.string().max(2000).nullable().optional(),
  postedAt: timestampSchemaAdmin.nullable().optional(),
  postedBy: z.string().nullable().optional(),
  wasEdited: z.boolean(),
  editedReply: z.string().max(2000).nullable().optional(),
});
