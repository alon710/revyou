/**
 * Cloud Functions for Google Review AI Reply
 * Phase 7: Review Management & AI Reply Generation
 */

// Review notification and processing triggers
export { onReviewNotification } from "./triggers/onReviewNotification";
export { onReviewCreated } from "./triggers/onReviewCreated";

// Export auto-post service for potential manual triggering
export { autoPostReply } from "./services/autoPost";
