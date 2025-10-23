# Phase 7 Implementation Guide - Remaining Tasks

## 🎯 Overview

This guide contains detailed implementation instructions for completing Phase 7: Review Management & AI Reply Generation.

**Status:** Foundation complete (AI, Google API, Database types)
**Remaining:** 18 implementation tasks

---

## ✅ Already Completed

1. ✅ Installed `@google/generative-ai` package
2. ✅ Created [lib/ai/gemini.ts](lib/ai/gemini.ts) - Gemini API client
3. ✅ Created [lib/ai/nameTranslator.ts](lib/ai/nameTranslator.ts) - Name translation
4. ✅ Created [lib/ai/prompts.ts](lib/ai/prompts.ts) - Prompt template builder
5. ✅ Updated [types/database.ts](types/database.ts) - Added new config fields
6. ✅ Created [lib/google/notifications.ts](lib/google/notifications.ts) - Notification API
7. ✅ Implemented `postReviewReply()` in [lib/google/business-profile.ts](lib/google/business-profile.ts)

---

## 📝 Remaining Implementation Tasks

### Section 1: Cloud Functions (Backend)

#### Task 1: Pub/Sub Receiver Function
**File:** `/functions/src/triggers/onReviewNotification.ts`

**Purpose:** Receives Pub/Sub push notifications when Google reviews are created/updated.

**Implementation:**
```typescript
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PubSubMessage {
  data: string; // Base64 encoded
  attributes?: Record<string, string>;
}

interface ReviewNotification {
  locationResourceName: string;
  reviewResourceName: string;
  notificationType: "NEW_REVIEW" | "UPDATED_REVIEW";
}

/**
 * Cloud Function to receive Pub/Sub notifications about new reviews
 * Triggered by push subscription from Google Business Profile
 */
export const onReviewNotification = functions.onRequest(
  { cors: true },
  async (req, res) => {
    try {
      // Verify it's a POST request
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      // Parse Pub/Sub message
      const pubsubMessage: PubSubMessage = req.body.message;

      if (!pubsubMessage || !pubsubMessage.data) {
        logger.warn("No Pub/Sub message data");
        res.status(400).send("Bad Request");
        return;
      }

      // Decode message data
      const decodedData = Buffer.from(pubsubMessage.data, "base64").toString();
      const notification: ReviewNotification = JSON.parse(decodedData);

      logger.info("Received review notification:", notification);

      // Extract location and review IDs from resource names
      const locationMatch = notification.locationResourceName.match(
        /locations\/([^/]+)/
      );
      const reviewMatch = notification.reviewResourceName.match(
        /reviews\/([^/]+)/
      );

      if (!locationMatch || !reviewMatch) {
        logger.error("Invalid resource names in notification");
        res.status(400).send("Invalid resource names");
        return;
      }

      const locationId = locationMatch[1];
      const reviewId = reviewMatch[1];

      // Find the business in Firestore by googleLocationId
      const businessQuery = await db
        .collection("businesses")
        .where("googleLocationId", "==", locationId)
        .limit(1)
        .get();

      if (businessQuery.empty) {
        logger.warn(`No business found for location ${locationId}`);
        res.status(200).send("OK"); // Return 200 to avoid retry
        return;
      }

      const businessDoc = businessQuery.docs[0];
      const businessId = businessDoc.id;
      const businessData = businessDoc.data();

      // Check if review already exists
      const existingReview = await db
        .collection("reviews")
        .where("googleReviewId", "==", reviewId)
        .limit(1)
        .get();

      if (!existingReview.empty) {
        logger.info(`Review ${reviewId} already exists, skipping`);
        res.status(200).send("OK");
        return;
      }

      // Extract review details from notification attributes
      const attrs = pubsubMessage.attributes || {};

      // Create review document in Firestore
      // Note: You'll need to fetch full review details from Google API
      // For now, create a placeholder that will be enriched
      await db.collection("reviews").add({
        businessId,
        googleReviewId: reviewId,
        reviewerName: attrs.reviewerName || "Unknown",
        reviewerPhotoUrl: attrs.reviewerPhotoUrl || null,
        rating: parseInt(attrs.starRating || "0"),
        reviewText: attrs.comment || "",
        reviewDate: admin.firestore.Timestamp.now(),
        receivedAt: admin.firestore.Timestamp.now(),
        replyStatus: "pending",
        wasEdited: false,
      });

      logger.info(`Created review document for ${reviewId}`);

      // The Firestore trigger will now handle AI generation
      res.status(200).send("OK");
    } catch (error) {
      logger.error("Error processing review notification:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
```

**Next Steps:**
1. Create this file in `/functions/src/triggers/onReviewNotification.ts`
2. Export it in `/functions/src/index.ts`

---

#### Task 2: AI Reply Generation Trigger
**File:** `/functions/src/triggers/onReviewCreated.ts`

**Purpose:** Firestore trigger that generates AI reply when a new review is created.

**Implementation:**
```typescript
import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

// Import Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// You'll need to set GEMINI_API_KEY in Firebase Functions config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to translate names (simplified version)
function translateNameToHebrew(name: string): string {
  const nameMap: Record<string, string> = {
    john: "ג'ון",
    sarah: "שרה",
    david: "דוד",
    michael: "מיכאל",
    // Add more as needed
  };

  const firstName = name.trim().split(/\s+/)[0].toLowerCase();
  return nameMap[firstName] || name;
}

// Helper function to build prompt
function buildPrompt(
  businessName: string,
  businessDescription: string,
  rating: number,
  reviewerName: string,
  reviewText: string,
  toneOfVoice: string,
  useEmojis: boolean,
  signature: string,
  customInstructions?: string
): string {
  const reviewerNameHeb = translateNameToHebrew(reviewerName);

  return `אתה מודל AI שתפקידו לענות על ביקורות גוגל של ${businessName}.

על העסק:
${businessDescription}

הוראות:
- שפה: עברית בלבד
- אורך: 1-2 משפטים בלבד
- פתיחה: התחל בפנייה ל-${reviewerNameHeb}
- טון: ${toneOfVoice}
- אימוג'ים: ${useEmojis ? "מותר" : "אסור"}
- חתימה: ${signature}

${customInstructions ? `הנחיות נוספות: ${customInstructions}` : ""}

הביקורת:
דירוג: ${rating}/5
שם: ${reviewerName}
טקסט: ${reviewText || "(אין טקסט)"}

צור תגובה קצרה (1-2 משפטים) שמתחילה ב-${reviewerNameHeb} ומסתיימת ב-${signature}.`;
}

/**
 * Firestore trigger: Generate AI reply when new review is created
 */
export const onReviewCreated = functions.onDocumentCreated(
  "reviews/{reviewId}",
  async (event) => {
    try {
      const reviewData = event.data?.data();
      const reviewId = event.params.reviewId;

      if (!reviewData) {
        logger.warn("No review data");
        return;
      }

      logger.info(`Processing new review: ${reviewId}`);

      // Get business configuration
      const businessDoc = await db
        .collection("businesses")
        .doc(reviewData.businessId)
        .get();

      if (!businessDoc.exists) {
        logger.error(`Business ${reviewData.businessId} not found`);
        return;
      }

      const business = businessDoc.data();
      const config = business?.config;

      if (!config) {
        logger.error("Business config not found");
        return;
      }

      // Check if AI generation is enabled for this rating
      const starConfig = config.starConfigs[reviewData.rating];
      if (!starConfig || !starConfig.enabled) {
        logger.info(`AI generation disabled for ${reviewData.rating} stars`);
        await db.collection("reviews").doc(reviewId).update({
          replyStatus: "skipped",
        });
        return;
      }

      // Build prompt
      const prompt = buildPrompt(
        business.name,
        config.businessDescription,
        reviewData.rating,
        reviewData.reviewerName,
        reviewData.reviewText,
        config.toneOfVoice,
        config.useEmojis,
        config.signature || `צוות ${business.name}`,
        starConfig.customInstructions
      );

      // Generate reply with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const aiReply = result.response.text().trim();

      logger.info(`Generated AI reply: ${aiReply}`);

      // Determine reply status
      let replyStatus: "pending" | "approved" = "pending";

      if (config.autoPost && !config.requireApproval) {
        replyStatus = "approved";
        // TODO: Trigger auto-post (implement in Task 3)
      }

      // Update review with AI reply
      await db.collection("reviews").doc(reviewId).update({
        aiReply,
        aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        replyStatus,
      });

      logger.info(`Updated review ${reviewId} with AI reply`);
    } catch (error) {
      logger.error("Error generating AI reply:", error);

      // Mark as failed
      await db.collection("reviews").doc(event.params.reviewId).update({
        replyStatus: "failed",
      });
    }
  }
);
```

**Next Steps:**
1. Create this file in `/functions/src/triggers/onReviewCreated.ts`
2. Add `GEMINI_API_KEY` to Firebase Functions config:
   ```bash
   firebase functions:config:set gemini.api_key="your_key_here"
   ```
3. Export in `/functions/src/index.ts`

---

#### Task 3: Auto-Post Service
**File:** `/functions/src/services/autoPost.ts`

**Purpose:** Helper service to automatically post approved replies to Google.

**Implementation:**
```typescript
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const db = admin.firestore();

/**
 * Auto-post reply to Google Business Profile
 * @param reviewId - Firestore review document ID
 * @param userId - User who owns the business
 */
export async function autoPostReply(
  reviewId: string,
  userId: string
): Promise<void> {
  try {
    // Get review data
    const reviewDoc = await db.collection("reviews").doc(reviewId).get();

    if (!reviewDoc.exists) {
      throw new Error("Review not found");
    }

    const review = reviewDoc.data();
    if (!review) return;

    // Get user's Google refresh token
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const user = userDoc.data();
    const refreshToken = user?.googleRefreshToken;

    if (!refreshToken) {
      throw new Error("No Google refresh token found");
    }

    // Decrypt token if encrypted (you should implement encryption)
    const decryptedToken = refreshToken; // TODO: Decrypt

    // Setup OAuth client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: decryptedToken });

    // Post reply using Google API
    const mybusiness = google.mybusinessaccountmanagement("v1");

    const replyText = review.editedReply || review.aiReply;

    await mybusiness.accounts.locations.reviews.updateReply({
      name: `accounts/${review.googleAccountId}/locations/${review.googleLocationId}/reviews/${review.googleReviewId}`,
      auth: oauth2Client,
      requestBody: {
        comment: replyText,
      },
    });

    // Update review as posted
    await db.collection("reviews").doc(reviewId).update({
      replyStatus: "posted",
      postedReply: replyText,
      postedAt: admin.firestore.FieldValue.serverTimestamp(),
      postedBy: userId,
    });

    logger.info(`Successfully posted reply for review ${reviewId}`);
  } catch (error) {
    logger.error("Error auto-posting reply:", error);

    // Mark as failed
    await db.collection("reviews").doc(reviewId).update({
      replyStatus: "failed",
    });

    throw error;
  }
}
```

---

#### Task 4: Update Functions Index
**File:** `/functions/src/index.ts`

**Implementation:**
```typescript
// Export all Cloud Functions

export { onReviewNotification } from "./triggers/onReviewNotification";
export { onReviewCreated } from "./triggers/onReviewCreated";

// Add more exports as you create them
```

---

#### Task 5: Update Functions Package.json
**File:** `/functions/package.json`

Add dependencies:
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "@google/generative-ai": "^0.1.0",
    "googleapis": "^128.0.0",
    "google-auth-library": "^9.0.0"
  }
}
```

Run in `/functions` directory:
```bash
cd functions
npm install @google/generative-ai googleapis google-auth-library
cd ..
```

---

### Section 2: API Routes (Next.js)

#### Task 6: Manual Reply Generation API
**File:** `/app/api/reviews/[id]/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateReplyWithRetry } from "@/lib/ai/gemini";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import { getReview, updateReviewReply } from "@/lib/firebase/reviews";
import { getBusiness } from "@/lib/firebase/businesses";
import { auth } from "@/lib/firebase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get review
    const review = await getReview(params.id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business and verify ownership
    const business = await getBusiness(review.businessId);

    if (!business || business.userId !== userId) {
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

    // Generate reply
    const aiReply = await generateReplyWithRetry(prompt);

    // Update review
    await updateReviewReply(params.id, aiReply, false);

    return NextResponse.json({ aiReply });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 }
    );
  }
}
```

---

#### Task 7: Post Reply to Google API
**File:** `/app/api/reviews/[id]/post/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { postReviewReply } from "@/lib/google/business-profile";
import { getReview, markAsPosted, markAsFailed } from "@/lib/firebase/reviews";
import { getUser } from "@/lib/firebase/users";
import { auth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get review
    const review = await getReview(params.id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get user to access Google refresh token
    const user = await getUser(userId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Determine which reply to post
    const replyText = review.editedReply || review.aiReply;

    if (!replyText) {
      return NextResponse.json(
        { error: "No reply to post" },
        { status: 400 }
      );
    }

    // Construct review resource name
    const reviewName = `accounts/${review.googleAccountId}/locations/${review.googleLocationId}/reviews/${review.googleReviewId}`;

    // Post to Google
    await postReviewReply(refreshToken, reviewName, replyText);

    // Update review status
    await markAsPosted(params.id, replyText, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting reply:", error);

    // Mark as failed
    await markAsFailed(params.id);

    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 }
    );
  }
}
```

---

#### Task 8: Enable Notifications API
**File:** `/app/api/google/notifications/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { enableNotifications, getPubSubTopicName } from "@/lib/google/notifications";
import { getBusiness, updateBusiness } from "@/lib/firebase/businesses";
import { getUser } from "@/lib/firebase/users";
import { auth } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/google/oauth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get business ID from request
    const { businessId } = await req.json();

    // Get business and verify ownership
    const business = await getBusiness(businessId);

    if (!business || business.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's Google refresh token
    const user = await getUser(userId);

    if (!user || !user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 400 }
      );
    }

    // Decrypt refresh token
    const refreshToken = decryptToken(user.googleRefreshToken);

    // Get Pub/Sub topic name
    const topicName = getPubSubTopicName();

    // Enable notifications
    await enableNotifications(
      refreshToken,
      `accounts/${business.googleAccountId}`,
      topicName
    );

    // Update business record
    await updateBusiness(businessId, { notificationsEnabled: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enabling notifications:", error);
    return NextResponse.json(
      { error: "Failed to enable notifications" },
      { status: 500 }
    );
  }
}
```

---

### Section 3: Client-Side Actions

#### Task 9: Review Actions Helper
**File:** `/lib/reviews/actions.ts`

```typescript
import { approveReply as approveReplyFb, rejectReply as rejectReplyFb, updateReviewReply } from "@/lib/firebase/reviews";

/**
 * Approve a review reply
 */
export async function approveReply(reviewId: string): Promise<void> {
  await approveReplyFb(reviewId);
}

/**
 * Reject a review reply
 */
export async function rejectReply(reviewId: string): Promise<void> {
  await rejectReplyFb(reviewId);
}

/**
 * Edit a review reply
 */
export async function editReply(reviewId: string, newReply: string): Promise<void> {
  await updateReviewReply(reviewId, newReply, true);
}

/**
 * Generate AI reply (calls API route)
 */
export async function regenerateReply(reviewId: string, token: string): Promise<string> {
  const response = await fetch(`/api/reviews/${reviewId}/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to generate reply");
  }

  const data = await response.json();
  return data.aiReply;
}

/**
 * Post reply to Google (calls API route)
 */
export async function postReplyToGoogle(reviewId: string, token: string): Promise<void> {
  const response = await fetch(`/api/reviews/${reviewId}/post`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to post reply");
  }
}
```

---

### Section 4: UI Components

#### Task 10: StarRating Component
**File:** `/components/ui/StarRating.tsx`

```typescript
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // 1-5
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 20, className = "" }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${className}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}
```

---

#### Task 11-18: Additional Components & Pages

Due to length constraints, here's the structure for remaining components:

**Task 11:** `/components/dashboard/ReviewCard.tsx`
- Display review with all details
- Show AI reply preview
- Action buttons based on status
- Use ShadCN Card, Button, Badge components

**Task 12:** `/components/dashboard/ReviewFilters.tsx`
- Business dropdown (Select)
- Status multi-select
- Star rating filter
- Date range picker

**Task 13:** `/components/dashboard/ReplyEditor.tsx`
- Modal with Textarea
- Character count
- Save/Cancel buttons
- Use ShadCN Dialog

**Task 14:** `/app/(dashboard)/reviews/page.tsx`
- Fetch reviews with filters
- Pagination
- Display ReviewCard components
- Hebrew RTL layout

**Task 15:** `/app/(dashboard)/reviews/[id]/page.tsx`
- Single review detail view
- Larger reply editor
- History of edits

**Task 16-17:** Update Business Config Forms
- Add new fields to BusinessConfigForm
- Phone, maxSentences, emojis, signature inputs

**Task 18:** Add Notification Toggle to Businesses Page
- Enable/disable button per business
- Call `/api/google/notifications` endpoint

---

## 🔧 Environment Variables Needed

Add to `.env.local`:
```env
# Already have these
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Add these
PUBSUB_TOPIC_NAME=google-business-reviews
```

Add to Firebase Functions config:
```bash
firebase functions:config:set gemini.api_key="your_key_here"
firebase functions:config:set google.client_id="your_client_id"
firebase functions:config:set google.client_secret="your_client_secret"
```

---

## 🚀 Deployment Checklist

### 1. Google Cloud Console Setup
- [ ] Create Pub/Sub topic: `google-business-reviews`
- [ ] Grant permissions to `mybusiness-api-pubsub@system.gserviceaccount.com`
- [ ] Create Push subscription pointing to Cloud Function URL

### 2. Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 3. Get Cloud Function URL
After deployment, note the `onReviewNotification` function URL.
Configure it as the Pub/Sub push endpoint.

### 4. Test Flow
1. Connect a business
2. Enable notifications via API
3. Leave a test review on Google
4. Verify Pub/Sub notification received
5. Check Firestore for new review document
6. Verify AI reply generated
7. Test manual approval/posting

---

## 📚 Helper Scripts

### Test Gemini Connection
Add to `package.json`:
```json
{
  "scripts": {
    "test:gemini": "tsx scripts/test-gemini.ts"
  }
}
```

Create `/scripts/test-gemini.ts`:
```typescript
import { testGeminiConnection } from "@/lib/ai/gemini";

async function test() {
  console.log("Testing Gemini connection...");
  const result = await testGeminiConnection();
  console.log("Result:", result ? "✅ Success" : "❌ Failed");
}

test();
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Pub/Sub messages not received
**Solution:** Verify:
- Topic permissions granted to Google service account
- Push subscription correctly configured
- Cloud Function is deployed and public

### Issue 2: Gemini API errors
**Solution:**
- Check API key is valid
- Verify quota limits
- Check prompt length (max ~30k chars)

### Issue 3: Review posting fails
**Solution:**
- Verify Google OAuth scopes include `business.manage`
- Check refresh token is valid
- Verify resource name format

---

## 📖 Next Steps After Implementation

1. **Test with real reviews** - Connect actual business and monitor
2. **Add monitoring** - Set up Firebase alerts for failures
3. **Optimize prompts** - Iterate on prompt templates based on results
4. **Add analytics** - Track reply quality and acceptance rates
5. **Implement Phase 8** - Add more advanced features

---

## 💡 Tips

- Start with manual generation API to test AI before enabling auto-post
- Use Firebase Emulator for local testing
- Keep Gemini prompts under review - adjust based on results
- Monitor Firebase Functions logs closely during initial deployment
- Consider rate limiting on API routes to prevent abuse

---

**Questions or issues?** Refer back to completed files in:
- `/lib/ai/` - AI implementation
- `/lib/google/` - Google API clients
- `/types/database.ts` - Type definitions

Good luck with implementation! 🎉
