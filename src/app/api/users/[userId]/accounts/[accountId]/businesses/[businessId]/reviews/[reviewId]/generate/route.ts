import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsController } from "@/lib/controllers";
import { BusinessesController } from "@/lib/controllers";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      userId: string;
      accountId: string;
      businessId: string;
      reviewId: string;
    }>;
  }
) {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();
    const { userId, accountId, businessId, reviewId } = await params;

    if (authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden: Cannot access another user's data" }, { status: 403 });
    }

    const reviewController = new ReviewsController(userId, accountId, businessId);
    const review = await reviewController.getReview(reviewId);

    const businessController = new BusinessesController(userId, accountId);
    const business = await businessController.getBusiness(businessId);

    const prompt = buildReplyPrompt(business.config, review, business.name, business.config.phoneNumber);
    const aiReply = await generateAIReply(prompt);

    const updatedReview = await reviewController.updateAiReply(reviewId, aiReply);

    return NextResponse.json({
      review: updatedReview,
      aiReply,
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate AI reply",
      },
      { status: 500 }
    );
  }
}
