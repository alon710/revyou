import { z } from "zod";
import { Timestamp } from "firebase/firestore";

const timestampSchema = z.custom<Timestamp>((val) => val instanceof Timestamp, {
  message: "Must be a Firestore Timestamp",
});

export const subscriptionTierSchema = z.enum(["free", "basic", "pro"]);
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

export const userSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  createdAt: timestampSchema,
  stripeCustomerId: z.string().nullish(),
  googleRefreshToken: z.string().nullish(),
  selectedLocationId: z.string().optional(),
});

export const userUpdateSchema = userSchema
  .partial()
  .omit({ uid: true, createdAt: true });

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

export const reviewCreateSchema = reviewSchema.omit({ id: true });

export const reviewUpdateSchema = reviewSchema
  .partial()
  .omit({ id: true, googleReviewId: true, receivedAt: true });

export const subscriptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  stripeSubscriptionId: z.string().min(1),
  stripePriceId: z.string().min(1),
  status: subscriptionStatusSchema,
  currentPeriodEnd: timestampSchema,
  cancelAtPeriodEnd: z.boolean(),
});

export const subscriptionCreateSchema = subscriptionSchema.omit({ id: true });

export const subscriptionUpdateSchema = subscriptionSchema
  .partial()
  .omit({ id: true, userId: true, stripeSubscriptionId: true });

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
