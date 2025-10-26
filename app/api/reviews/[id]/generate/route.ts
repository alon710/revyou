import { NextRequest, NextResponse } from "next/server";
import { generateReplyWithRetry } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import {
  getReviewAdmin,
  updateReviewReplyAdmin,
} from "@/lib/firebase/reviews.admin";
import { getBusinessAdmin } from "@/lib/firebase/businesses.admin";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * POST /api/reviews/[id]/generate
 * Manually trigger AI reply generation for a review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authenticatedUserId = decodedToken.uid;

    // Get review ID from URL params
    const { id: reviewId } = await params;

    // Get userId and businessId from request body
    const { userId: requestUserId, businessId } = await req.json();

    // Verify ownership
    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get review using Admin SDK with direct path access
    const review = await getReviewAdmin(
      authenticatedUserId,
      businessId,
      reviewId
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business and verify ownership using Admin SDK
    const business = await getBusinessAdmin(authenticatedUserId, businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Build prompt
    const prompt = buildReplyPrompt(
      business.config,
      {
        rating: review.rating,
        reviewerName: review.reviewerName,
        reviewText: review.reviewText,
      },
      business.name,
      business.config.businessPhone
    );

    // Generate reply with Gemini
    const aiReply = await generateReplyWithRetry(prompt);

    // Update review using Admin SDK
    await updateReviewReplyAdmin(
      authenticatedUserId,
      businessId,
      reviewId,
      aiReply,
      false
    );

    return NextResponse.json({ aiReply, success: true });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate reply",
      },
      { status: 500 }
    );
  }
}
