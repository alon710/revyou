import { NextRequest, NextResponse } from "next/server";
import { generateAIReply } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";
import { getReviewAdmin } from "@/lib/firebase/reviews.admin";
import { updateReviewReplyAdmin } from "@/lib/firebase/reviews.admin";
import { getBusinessAdmin } from "@/lib/firebase/businesses.admin";
import { getAuthenticatedUserId } from "@/lib/api/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUserId();
    const { userId: authenticatedUserId } = authResult;
    const { id: reviewId } = await params;
    const { userId: requestUserId, accountId, businessId } = await req.json();
    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const review = await getReviewAdmin(
      authenticatedUserId,
      accountId,
      businessId,
      reviewId
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const business = await getBusinessAdmin(
      authenticatedUserId,
      accountId,
      businessId
    );

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const prompt = buildReplyPrompt(
      business.config,
      review,
      business.name,
      business.config.phoneNumber
    );

    const aiReply = await generateAIReply(prompt);

    await updateReviewReplyAdmin(
      authenticatedUserId,
      accountId,
      businessId,
      reviewId,
      aiReply
    );

    return NextResponse.json({ aiReply, success: true });
  } catch (error) {
    console.error("Error in generate reply API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate reply";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
