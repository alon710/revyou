import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Admin SDK Validation Schemas
 * These schemas are compatible with Firebase Admin SDK which returns timestamps as Admin Timestamp objects
 */

// Admin SDK returns timestamps as firebase-admin Timestamp objects
const timestampSchemaAdmin = z.custom<Timestamp | Date>(
  (val) => val instanceof Timestamp || val instanceof Date || val === null || val === undefined,
  {
    message: "Must be a Firestore Admin Timestamp or Date object",
  }
);

export const subscriptionTierSchema = z.enum(["free", "basic", "professional"]);
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export const toneOfVoiceSchema = z.enum([
  "friendly",
  "formal",
  "humorous",
  "professional",
]);

export const languageModeSchema = z.enum([
  "hebrew",
  "english",
  "auto-detect",
  "match-reviewer",
]);

export const replyStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "posted",
  "failed",
]);

export const subscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
]);

export const starConfigSchema = z.object({
  customInstructions: z.string().max(1000),
  enabled: z.boolean(),
});

export const businessConfigSchema = z.object({
  businessDescription: z.string().min(10).max(2000),
  toneOfVoice: toneOfVoiceSchema,
  useEmojis: z.boolean(),
  languageMode: languageModeSchema,
  autoPost: z.boolean(),
  requireApproval: z.boolean(),
  starConfigs: z.object({
    1: starConfigSchema,
    2: starConfigSchema,
    3: starConfigSchema,
    4: starConfigSchema,
    5: starConfigSchema,
  }),
});

export const notificationPreferencesSchema = z.object({
  emailOnNewReview: z.boolean(),
  emailOnFailedPost: z.boolean(),
});

export const userSchemaAdmin = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().url(),
  createdAt: timestampSchemaAdmin,
  subscriptionTier: subscriptionTierSchema,
  stripeCustomerId: z.string().nullish(),
  googleRefreshToken: z.string().nullish(),
  selectedBusinessId: z.string().optional(),
  notificationPreferences: notificationPreferencesSchema.optional(),
});

export const businessSchemaAdmin = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleLocationId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  photoUrl: z.string().url().optional(),
  connected: z.boolean(),
  connectedAt: timestampSchemaAdmin,
  config: businessConfigSchema,
  notificationsEnabled: z.boolean().optional(),
});

export const reviewSchemaAdmin = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
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

export const subscriptionSchemaAdmin = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  stripeSubscriptionId: z.string().min(1),
  stripePriceId: z.string().min(1),
  status: subscriptionStatusSchema,
  currentPeriodEnd: timestampSchemaAdmin,
  cancelAtPeriodEnd: z.boolean(),
});
