import { NextRequest, NextResponse } from "next/server";
import { generateReplyWithRetry } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import { getReviewAdmin } from "@/lib/firebase/reviews.admin";
import { updateReviewReplyAdmin } from "@/lib/firebase/reviews.admin";
import { getLocationAdmin } from "@/lib/firebase/locations.admin";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authenticatedUserId = decodedToken.uid;

    const { id: reviewId } = await params;

    const { userId: requestUserId, businessId } = await req.json();

    if (requestUserId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const review = await getReviewAdmin(
      authenticatedUserId,
      businessId,
      reviewId
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const location = await getLocationAdmin(authenticatedUserId, businessId);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const prompt = buildReplyPrompt(
      location.config,
      {
        rating: review.rating,
        reviewerName: review.reviewerName,
        reviewText: review.reviewText,
      },
      location.name,
      location.config.businessPhone
    );

    const aiReply = await generateReplyWithRetry(prompt);

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
