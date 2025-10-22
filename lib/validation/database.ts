import { z } from "zod";
import { Timestamp } from "firebase/firestore";

/**
 * Zod schemas for database validation
 * These ensure data integrity before writing to Firestore
 */

// Custom Timestamp validator
const timestampSchema = z.custom<Timestamp>(
  (val) => val instanceof Timestamp,
  { message: "Must be a Firestore Timestamp" }
);

// Enums
export const subscriptionTierSchema = z.enum(["free", "basic", "pro", "enterprise"]);
export const toneOfVoiceSchema = z.enum(["friendly", "formal", "humorous", "professional"]);
export const languageModeSchema = z.enum(["hebrew", "english", "auto-detect", "match-reviewer"]);
export const replyStatusSchema = z.enum(["pending", "approved", "rejected", "posted", "failed"]);
export const subscriptionStatusSchema = z.enum(["active", "canceled", "past_due"]);

// Star configuration schema
export const starConfigSchema = z.object({
  customInstructions: z.string().max(1000),
  enabled: z.boolean(),
});

// Business configuration schema
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

// User schema
export const userSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().url(),
  createdAt: timestampSchema,
  subscriptionTier: subscriptionTierSchema,
  stripeCustomerId: z.string().optional(),
  googleRefreshToken: z.string().optional(),
});

// Partial user schema for updates
export const userUpdateSchema = userSchema.partial().omit({ uid: true, createdAt: true });

// Business schema
export const businessSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  googleAccountId: z.string().min(1),
  googleLocationId: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  photoUrl: z.string().url().optional(),
  connected: z.boolean(),
  connectedAt: timestampSchema,
  config: businessConfigSchema,
});

// Business create schema (without id)
export const businessCreateSchema = businessSchema.omit({ id: true });

// Business update schema (partial, without id, userId, connectedAt)
export const businessUpdateSchema = businessSchema
  .partial()
  .omit({ id: true, userId: true, connectedAt: true });

// Review schema
export const reviewSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  googleReviewId: z.string().min(1),
  reviewerName: z.string().min(1).max(200),
  reviewerPhotoUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(5000),
  reviewDate: timestampSchema,
  receivedAt: timestampSchema,

  // AI Reply
  aiReply: z.string().max(2000).optional(),
  aiReplyGeneratedAt: timestampSchema.optional(),
  replyStatus: replyStatusSchema,

  // Posted reply
  postedReply: z.string().max(2000).nullable().optional(),
  postedAt: timestampSchema.nullable().optional(),
  postedBy: z.string().nullable().optional(),

  // If user edited the AI reply
  wasEdited: z.boolean(),
  editedReply: z.string().max(2000).nullable().optional(),
});

// Review create schema (without id)
export const reviewCreateSchema = reviewSchema.omit({ id: true });

// Review update schema
export const reviewUpdateSchema = reviewSchema
  .partial()
  .omit({ id: true, businessId: true, googleReviewId: true, receivedAt: true });

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  stripeSubscriptionId: z.string().min(1),
  stripePriceId: z.string().min(1),
  status: subscriptionStatusSchema,
  currentPeriodEnd: timestampSchema,
  cancelAtPeriodEnd: z.boolean(),
});

// Subscription create schema (without id)
export const subscriptionCreateSchema = subscriptionSchema.omit({ id: true });

// Subscription update schema
export const subscriptionUpdateSchema = subscriptionSchema
  .partial()
  .omit({ id: true, userId: true, stripeSubscriptionId: true });

/**
 * Type exports inferred from schemas
 * These can be used alongside the database types
 */
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type BusinessCreateInput = z.infer<typeof businessCreateSchema>;
export type BusinessUpdateInput = z.infer<typeof businessUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
