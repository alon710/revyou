import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, accounts, userAccounts, businessConfigs, type ReviewInsert } from "@/lib/db/schema";
import { getReview, starRatingToNumber, parseGoogleTimestamp } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import type { BusinessWithConfig } from "@/lib/db/repositories/businesses.repository";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";

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
  business: BusinessWithConfig;
}

/**
 * Find business by Google Business ID across all accounts
 * This is the equivalent of Firestore's collectionGroup query
 */
async function findBusinessByGoogleBusinessId(googleBusinessId: string): Promise<BusinessLookupResult | null> {
  try {
    console.log("Searching for business with googleBusinessId:", googleBusinessId);

    const result = await db
      .select({
        business: businesses,
        account: accounts,
        userAccount: userAccounts,
        config: businessConfigs,
      })
      .from(businesses)
      .innerJoin(accounts, eq(businesses.accountId, accounts.id))
      .innerJoin(userAccounts, eq(accounts.id, userAccounts.accountId))
      .leftJoin(businessConfigs, eq(businesses.id, businessConfigs.businessId))
      .where(eq(businesses.googleBusinessId, googleBusinessId))
      .limit(1);

    if (result.length === 0) {
      console.error("No business found for googleBusinessId:", googleBusinessId);
      return null;
    }

    const { business, userAccount, config } = result[0];

    if (!config) {
      console.error("Business config not found for business:", business.id);
      return null;
    }

    const businessWithConfig: BusinessWithConfig = {
      ...business,
      config: {
        name: config.name,
        description: config.description || undefined,
        phoneNumber: config.phoneNumber || undefined,
        toneOfVoice: config.toneOfVoice as "friendly" | "formal" | "humorous" | "professional",
        useEmojis: config.useEmojis,
        languageMode: config.languageMode as "hebrew" | "english" | "auto-detect",
        languageInstructions: config.languageInstructions || undefined,
        maxSentences: config.maxSentences || undefined,
        allowedEmojis: config.allowedEmojis || undefined,
        signature: config.signature || undefined,
        starConfigs: config.starConfigs,
      },
      emailOnNewReview: config.emailOnNewReview,
    };

    return {
      userId: userAccount.userId,
      accountId: business.accountId,
      business: businessWithConfig,
    };
  } catch (error) {
    console.error("Error finding business:", error);
    return null;
  }
}

/**
 * Get account's encrypted refresh token
 */
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

/**
 * Google Pub/Sub webhook endpoint for receiving review notifications
 *
 * This endpoint receives notifications from Google My Business when:
 * - A new review is posted
 * - An existing review is updated
 *
 * Flow:
 * 1. Parse the Pub/Sub message
 * 2. Find the business in our database by googleBusinessId
 * 3. Fetch the full review data from Google API
 * 4. Create the review in our database
 * 5. Trigger review processing (which will generate AI reply)
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PubSubMessage;

    console.log("Received Pub/Sub notification:", {
      messageId: body.message.messageId,
      publishTime: body.message.publishTime,
    });

    // Decode the base64 message data
    const messageData = body.message.data;
    const notificationJson = Buffer.from(messageData, "base64").toString("utf-8");
    const notification: PubSubNotificationData = JSON.parse(notificationJson);

    console.log("Parsed notification:", notification);

    const { type: notificationType, review: reviewName, location: locationName } = notification;

    // Only process new and updated reviews
    if (notificationType !== "NEW_REVIEW" && notificationType !== "UPDATED_REVIEW") {
      console.log("Ignoring non-review notification:", notificationType);
      return NextResponse.json({ message: "Notification type ignored" }, { status: 200 });
    }

    // Find the business in our database
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

    // Check if business is connected
    if (!business.connected) {
      console.log("Business not connected, skipping notification:", business.id);
      return NextResponse.json({ message: "Business not connected" }, { status: 200 });
    }

    // Get the account's refresh token
    const encryptedToken = await getAccountRefreshToken(userId, accountId);
    if (!encryptedToken) {
      console.error("No refresh token found for account:", accountId);
      return NextResponse.json({ error: "No refresh token found" }, { status: 400 });
    }

    // Decrypt the refresh token
    const refreshToken = await decryptToken(encryptedToken);

    // Fetch the full review data from Google
    console.log("Fetching review from Google API:", reviewName);
    const googleReview = await getReview(
      reviewName,
      refreshToken,
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    console.log("Fetched Google review:", {
      reviewId: googleReview.reviewId,
      rating: googleReview.starRating,
      reviewer: googleReview.reviewer.displayName,
    });

    // Check if review already exists
    const reviewsRepo = new ReviewsRepository(userId, accountId, business.id);
    const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

    if (existingReview) {
      console.log("Review already exists, skipping:", existingReview.id);
      return NextResponse.json({ message: "Review already exists" }, { status: 200 });
    }

    // Prepare review data
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

    // Create the review in database
    console.log("Creating new review in database");
    const newReview = await reviewsRepo.create(reviewData);
    console.log("Review created successfully:", newReview.id);

    // Trigger review processing asynchronously
    // We don't await this to keep the webhook response fast
    const processUrl = new URL("/api/internal/process-review", request.url);
    fetch(processUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add internal authentication header for security
        "X-Internal-Secret": process.env.INTERNAL_API_SECRET || "change-me-in-production",
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
