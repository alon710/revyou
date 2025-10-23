import { NextRequest, NextResponse } from "next/server";
import { generateReplyWithRetry } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import { getReview, updateReviewReply } from "@/lib/firebase/reviews";
import { getBusiness } from "@/lib/firebase/businesses";
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
    const userId = decodedToken.uid;

    // Get review
    const { id } = await params;
    const review = await getReview(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business and verify ownership
    const business = await getBusiness(review.businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Update review
    await updateReviewReply(id, aiReply, false);

    return NextResponse.json({ aiReply, success: true });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate reply",
      },
      { status: 500 }
    );
  }
}
