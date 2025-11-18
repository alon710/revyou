import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, type ReviewInsert, type Business } from "@/lib/db/schema";
import { getReview, starRatingToNumber, parseGoogleTimestamp } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface PubSubNotificationData {
  type: "NEW_REVIEW" | "UPDATED_REVIEW";
  review: string;
  location: string;
}

interface BusinessLookupResult {
  userId: string;
  accountId: string;
  business: Business;
}

async function findBusinessByGoogleBusinessId(googleBusinessId: string): Promise<BusinessLookupResult | null> {
  try {
    console.log("Searching for business with googleBusinessId:", googleBusinessId);

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.googleBusinessId, googleBusinessId),
      with: {
        account: {
          with: {
            userAccounts: true,
          },
        },
      },
    });

    if (!business) {
      console.error("No business found for googleBusinessId:", googleBusinessId);
      return null;
    }

    if (!business.account.userAccounts || business.account.userAccounts.length === 0) {
      console.error("No user accounts found for business:", business.id);
      return null;
    }

    const userAccount = business.account.userAccounts[0];

    return {
      userId: userAccount.userId,
      accountId: business.accountId,
      business: business,
    };
  } catch (error) {
    console.error("Error finding business:", error);
    return null;
  }
}

async function getAccountRefreshToken(userId: string, accountId: string): Promise<string | null> {
  try {
    const accountsRepo = new AccountsRepository(userId);
    const account = await accountsRepo.get(accountId);

    if (!account) {
      console.error("Account not found", { userId, accountId });
      return null;
    }

    return account.googleRefreshToken || null;
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PubSubMessage;

    console.log("Received Pub/Sub notification:", {
      messageId: body.message.messageId,
      publishTime: body.message.publishTime,
    });

    const messageData = body.message.data;
    const notificationJson = Buffer.from(messageData, "base64").toString("utf-8");
    const notification: PubSubNotificationData = JSON.parse(notificationJson);

    console.log("Parsed notification:", notification);

    const { type: notificationType, review: reviewName, location: locationName } = notification;

    if (notificationType !== "NEW_REVIEW" && notificationType !== "UPDATED_REVIEW") {
      console.log("Ignoring non-review notification:", notificationType);
      return NextResponse.json({ message: "Notification type ignored" }, { status: 200 });
    }

    const businessData = await findBusinessByGoogleBusinessId(locationName);
    if (!businessData) {
      console.error("Business not found for location:", locationName);
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { userId, accountId, business } = businessData;
    console.log("Found business:", {
      userId,
      accountId,
      businessId: business.id,
      businessName: business.name,
    });

    if (!business.connected) {
      console.log("Business not connected, skipping notification:", business.id);
      return NextResponse.json({ message: "Business not connected" }, { status: 200 });
    }

    const encryptedToken = await getAccountRefreshToken(userId, accountId);
    if (!encryptedToken) {
      console.error("No refresh token found for account:", accountId);
      return NextResponse.json({ error: "No refresh token found" }, { status: 400 });
    }

    const refreshToken = await decryptToken(encryptedToken);

    console.log("Fetching review from Google API:", reviewName);
    const googleReview = await getReview(
      reviewName,
      refreshToken,
      serverEnv.GOOGLE_CLIENT_ID,
      serverEnv.GOOGLE_CLIENT_SECRET
    );
    console.log("Fetched Google review:", {
      reviewId: googleReview.reviewId,
      rating: googleReview.starRating,
      reviewer: googleReview.reviewer.displayName,
    });

    const reviewsRepo = new ReviewsRepository(userId, accountId, business.id);
    const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

    if (existingReview) {
      console.log("Review already exists, skipping:", existingReview.id);
      return NextResponse.json({ message: "Review already exists" }, { status: 200 });
    }

    const reviewData: ReviewInsert = {
      accountId,
      businessId: business.id,
      googleReviewId: googleReview.reviewId,
      googleReviewName: googleReview.name,
      name: googleReview.reviewer.displayName,
      photoUrl: googleReview.reviewer.profilePhotoUrl || null,
      rating: starRatingToNumber(googleReview.starRating),
      text: googleReview.comment || "",
      date: parseGoogleTimestamp(googleReview.createTime),
      updateTime: parseGoogleTimestamp(googleReview.updateTime),
      receivedAt: new Date(),
      isAnonymous: googleReview.reviewer.isAnonymous || false,
      replyStatus: "pending",
      postedReply: null,
      postedAt: null,
      postedBy: null,
      aiReply: null,
      aiReplyGeneratedAt: null,
    };

    console.log("Creating new review in database");
    const newReview = await reviewsRepo.create(reviewData);
    console.log("Review created successfully:", newReview.id);

    const processUrl = new URL("/api/internal/process-review", request.url);
    fetch(processUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": serverEnv.INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        userId,
        accountId,
        businessId: business.id,
        reviewId: newReview.id,
      }),
    }).catch((error) => {
      console.error("Failed to trigger review processing:", error);
    });

    return NextResponse.json(
      {
        message: "Review received and queued for processing",
        reviewId: newReview.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Google review notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
