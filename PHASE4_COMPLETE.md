# Phase 4: Firestore Database Schema - COMPLETED ✅

## Summary
Successfully implemented comprehensive Firestore database schema with validation, security rules, helper functions, and optimized indexes for all collections.

---

## Completed Tasks

### 4.1 Database Helper Functions ✅

Created complete CRUD operations for all collections with validation, error handling, and Hebrew error messages.

#### Users Operations
**File**: [lib/firebase/users.ts](lib/firebase/users.ts)

Functions implemented:
- `getUser(uid)` - Fetch user by ID
- `createUser(uid, email, displayName, photoURL)` - Create new user
- `updateUser(uid, data)` - Update user profile
- `getUserSubscriptionTier(uid)` - Get user's subscription tier
- `updateUserSubscriptionTier(uid, tier)` - Update subscription tier
- `updateUserStripeCustomerId(uid, stripeCustomerId)` - Store Stripe customer ID
- `updateUserGoogleRefreshToken(uid, token)` - Store Google refresh token
- `userExists(uid)` - Check if user exists

**Features**:
- Zod validation on all inputs
- Null-safety for SSR compatibility
- Hebrew error messages
- Automatic data validation before returning

---

#### Business Operations
**File**: [lib/firebase/businesses.ts](lib/firebase/businesses.ts)

Functions implemented:
- `getUserBusinesses(userId)` - List all user's businesses
- `getBusiness(businessId)` - Get single business
- `createBusiness(data)` - Add new business with default config
- `updateBusinessConfig(businessId, config)` - Update business settings
- `updateBusiness(businessId, data)` - Update business data
- `deleteBusiness(businessId)` - Remove business
- `checkBusinessLimit(userId)` - Validate subscription limits
- `getRemainingBusinessSlots(userId)` - Get available slots
- `disconnectBusiness(businessId)` - Mark as disconnected
- `reconnectBusiness(businessId)` - Reconnect business
- `getConnectedBusinesses(userId)` - Get only connected businesses
- `countUserBusinesses(userId)` - Count user's businesses
- `getDefaultBusinessConfig()` - Get default configuration

**Features**:
- Subscription limit enforcement
- Default configuration merging
- Business connection status management
- Config validation with Zod

---

#### Review Operations
**File**: [lib/firebase/reviews.ts](lib/firebase/reviews.ts)

Functions implemented:
- `getReviewsByBusiness(businessId, filters?, limit?, lastDoc?)` - Fetch with pagination
- `getReview(reviewId)` - Get single review
- `createReview(data)` - Store new review
- `updateReviewReply(reviewId, reply, isEdited?)` - Update AI reply
- `approveReply(reviewId)` - Approve for posting
- `rejectReply(reviewId)` - Reject reply
- `markAsPosted(reviewId, postedReply, postedBy)` - Mark as posted
- `markAsFailed(reviewId)` - Mark as failed
- `updateReview(reviewId, data)` - Update review data
- `getReviewStats(businessId)` - Get statistics
- `getRecentReviews(businessId, limit?)` - Get recent reviews
- `getPendingReviews(businessId)` - Get pending reviews only
- `reviewExists(googleReviewId)` - Check if review exists

**Features**:
- Advanced filtering (status, rating, date range)
- Pagination with cursor support
- Statistics calculation
- Review duplicate checking
- Status management workflow

**Review Filters**:
```typescript
{
  status?: ReplyStatus;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
}
```

**Statistics Returned**:
- Total reviews
- Pending, approved, posted, rejected, failed counts
- Average rating

---

#### Subscription Operations
**File**: [lib/firebase/subscriptions.ts](lib/firebase/subscriptions.ts)

Functions implemented:
- `getUserSubscription(userId)` - Get active subscription
- `getSubscription(subscriptionId)` - Get by ID
- `getSubscriptionByStripeId(stripeSubscriptionId)` - Get by Stripe ID
- `createSubscription(data)` - Create new subscription
- `updateSubscriptionStatus(subscriptionId, status)` - Update status
- `updateSubscription(subscriptionId, data)` - Update subscription
- `cancelSubscription(subscriptionId)` - Mark to cancel at period end
- `reactivateSubscription(subscriptionId)` - Remove cancellation
- `hasActiveSubscription(userId)` - Check if active
- `getUserSubscriptions(userId)` - Get all subscriptions
- `isSubscriptionExpiringSoon(subscription)` - Check if expiring within 7 days
- `isSubscriptionExpired(subscription)` - Check if expired
- `getDaysRemaining(subscription)` - Calculate days remaining

**Features**:
- Stripe integration support
- Expiration checking
- Multi-subscription history
- Cancellation management

---

### 4.2 Validation & Type Guards ✅

**File**: [lib/validation/database.ts](lib/validation/database.ts)

Created Zod schemas for runtime validation:

#### Schemas Created:
- `userSchema` - Full user validation
- `userUpdateSchema` - Partial user updates
- `businessSchema` - Full business validation
- `businessCreateSchema` - Business creation
- `businessUpdateSchema` - Business updates
- `businessConfigSchema` - Business configuration
- `starConfigSchema` - Star-specific config
- `reviewSchema` - Full review validation
- `reviewCreateSchema` - Review creation
- `reviewUpdateSchema` - Review updates
- `subscriptionSchema` - Full subscription validation
- `subscriptionCreateSchema` - Subscription creation
- `subscriptionUpdateSchema` - Subscription updates

#### Enum Validators:
- `subscriptionTierSchema` - free, basic, pro, enterprise
- `toneOfVoiceSchema` - friendly, formal, humorous, professional
- `languageModeSchema` - hebrew, english, auto-detect, match-reviewer
- `replyStatusSchema` - pending, approved, rejected, posted, failed
- `subscriptionStatusSchema` - active, canceled, past_due

**Features**:
- Custom Timestamp validator for Firestore
- String length validation
- Required field validation
- Type inference for TypeScript

---

### 4.3 Enhanced Security Rules ✅

**File**: [firestore.rules](firestore.rules)

#### Helper Functions:
- `isAuthenticated()` - Check if user is logged in
- `isOwner(userId)` - Check document ownership
- `ownsBusinessDoc(businessId)` - Check business ownership
- `validStringLength(str, min, max)` - Validate string length
- `isValidTier(tier)` - Validate subscription tier
- `isValidTone(tone)` - Validate tone of voice
- `isValidLanguageMode(mode)` - Validate language mode
- `isValidReplyStatus(status)` - Validate reply status
- `isValidSubscriptionStatus(status)` - Validate subscription status
- `isValidRating(rating)` - Validate 1-5 star rating

#### Security Rules by Collection:

**Users Collection**:
- ✅ Read: Only own user data
- ✅ Create: With required fields validation
- ✅ Update: Cannot change uid or createdAt
- ✅ Delete: Disabled (should use Firebase Auth)

**Businesses Collection**:
- ✅ Read: Only own businesses
- ✅ Create: With full validation of config structure
- ✅ Update: Cannot change userId
- ✅ Delete: Only own businesses

**Reviews Collection**:
- ✅ Read: Only if owns the business
- ✅ Create: Full field validation, business ownership check
- ✅ Update: Cannot change businessId, validates status and reply
- ✅ Delete: Disabled (keep for history)

**Subscriptions Collection**:
- ✅ Read: Only own subscriptions
- ✅ Create: Via Stripe webhooks, full validation
- ✅ Update: Cannot change userId or stripeSubscriptionId
- ✅ Delete: Disabled (manage via Stripe)

**Security Features**:
- Field-level validation
- Data type checking
- Length limits enforcement
- Enum validation
- Immutable field protection
- Business ownership verification

---

### 4.4 Firestore Indexes ✅

**File**: [firestore.indexes.json](firestore.indexes.json)

#### Reviews Collection Indexes:
1. `businessId + receivedAt` - Get all reviews for a business
2. `businessId + replyStatus + receivedAt` - Filter by status
3. `businessId + rating + receivedAt` - Filter by rating
4. `businessId + rating + replyStatus + receivedAt` - Combined filters
5. `googleReviewId` - Check for duplicates

#### Businesses Collection Indexes:
1. `userId + connectedAt` - Get user's businesses
2. `userId + connected + connectedAt` - Get connected businesses only

#### Subscriptions Collection Indexes:
1. `userId + status + currentPeriodEnd` - Get active subscriptions
2. `userId + currentPeriodEnd` - Get all user subscriptions
3. `stripeSubscriptionId` - Webhook lookups

**Performance Benefits**:
- Fast queries with filters
- Efficient pagination
- Quick duplicate checking
- Optimized sorting

---

## File Structure

```
/lib
  /firebase
    ├── config.ts              # Firebase client config (Phase 1)
    ├── admin.ts               # Firebase Admin SDK (Phase 1)
    ├── auth.ts                # Auth utilities (Phase 3)
    ├── users.ts               ✅ NEW - User operations
    ├── businesses.ts          ✅ NEW - Business operations
    ├── reviews.ts             ✅ NEW - Review operations
    └── subscriptions.ts       ✅ NEW - Subscription operations

  /validation
    └── database.ts            ✅ NEW - Zod schemas

firestore.rules                ✅ ENHANCED - Field-level validation
firestore.indexes.json         ✅ ENHANCED - Additional indexes
```

---

## Usage Examples

### User Operations

```typescript
import { getUser, updateUser } from "@/lib/firebase/users";

// Get user data
const user = await getUser("user_id");

// Update user profile
const updated = await updateUser("user_id", {
  displayName: "שם חדש"
});
```

### Business Operations

```typescript
import {
  getUserBusinesses,
  createBusiness,
  updateBusinessConfig,
  checkBusinessLimit
} from "@/lib/firebase/businesses";

// Check if user can add more businesses
const canAdd = await checkBusinessLimit(userId);

// Create new business
const business = await createBusiness({
  userId: "user_id",
  googleAccountId: "google_account_id",
  googleLocationId: "location_id",
  name: "שם העסק",
  address: "כתובת העסק",
  config: {
    businessDescription: "תיאור העסק",
    toneOfVoice: "professional"
  }
});

// Update configuration
await updateBusinessConfig(businessId, {
  autoPost: true,
  requireApproval: false
});
```

### Review Operations

```typescript
import {
  getReviewsByBusiness,
  approveReply,
  markAsPosted,
  getReviewStats
} from "@/lib/firebase/reviews";

// Get reviews with filters
const { reviews, hasMore, lastDoc } = await getReviewsByBusiness(
  businessId,
  { status: "pending", rating: 5 },
  20
);

// Approve reply
await approveReply(reviewId);

// Mark as posted
await markAsPosted(reviewId, "התגובה שפורסמה", userId);

// Get statistics
const stats = await getReviewStats(businessId);
// { total, pending, posted, averageRating, ... }
```

### Subscription Operations

```typescript
import {
  getUserSubscription,
  hasActiveSubscription,
  isSubscriptionExpiringSoon
} from "@/lib/firebase/subscriptions";

// Get active subscription
const subscription = await getUserSubscription(userId);

// Check if active
const isActive = await hasActiveSubscription(userId);

// Check if expiring soon
if (subscription && isSubscriptionExpiringSoon(subscription)) {
  console.log("מינוי עומד לפוג בקרוב");
}
```

---

## Testing Checklist

Before moving to Phase 5, verify:

- [ ] All database helper files created
- [ ] Validation schemas working with Zod
- [ ] User CRUD operations functional
- [ ] Business operations with limit checking
- [ ] Review operations with pagination
- [ ] Subscription management functions
- [ ] Firestore rules deployed
- [ ] Indexes created in Firebase Console
- [ ] Hebrew error messages displaying correctly
- [ ] Type checking passing
- [ ] Build succeeds

---

## Next Steps

Proceed to **Phase 5: Dashboard Layout & UI** to implement:

1. **Dashboard Layout** - Sidebar, header, main content area
2. **Sidebar Navigation** - Links to all sections
3. **Dashboard Home** - Overview with statistics
4. **Responsive Design** - Mobile and desktop layouts

---

## Key Features Delivered

✅ **Users Database Operations** - Complete CRUD with validation
✅ **Business Management Functions** - With subscription limits
✅ **Review Operations** - Advanced filtering and pagination
✅ **Subscription Functions** - Stripe integration ready
✅ **Zod Validation Schemas** - Runtime type safety
✅ **Enhanced Security Rules** - Field-level validation
✅ **Optimized Indexes** - Fast query performance
✅ **Hebrew Error Messages** - Localized user experience
✅ **Type Safety** - Full TypeScript support
✅ **Documentation** - Comprehensive usage examples

---

## Technical Highlights

### Validation Strategy
- **Client-side**: Zod schemas validate before Firestore writes
- **Server-side**: Firestore rules validate all writes
- **Double validation** ensures data integrity

### Error Handling
- All functions have try-catch blocks
- Hebrew error messages for user-facing errors
- Console errors for debugging
- Graceful fallbacks for SSR

### Performance Optimizations
- Composite indexes for complex queries
- Pagination with cursor support
- Duplicate checking with single-field index
- Limit-based queries to reduce reads

### Security Layers
1. **Authentication** - Firebase Auth
2. **Ownership** - Firestore rules check userId
3. **Validation** - Field-level data validation
4. **Immutability** - Protected fields (uid, createdAt, etc.)

---

**Phase 4 Completion Date**: October 21, 2025
**Status**: ✅ Ready for Phase 5
**Build Status**: ✅ Passing

---

## Notes for Future Development

1. **Database Functions**: All functions are SSR-safe with null checks
2. **Validation**: Both Zod (client) and Firestore rules (server) validate data
3. **Pagination**: Use `lastDoc` cursor for efficient pagination
4. **Indexes**: Deploy to Firebase with `firebase deploy --only firestore:indexes`
5. **Rules**: Deploy with `firebase deploy --only firestore:rules`
6. **Statistics**: `getReviewStats()` calculates in real-time, consider caching for large datasets
7. **Subscription Limits**: Enforced at business creation, check before allowing operations

---

## Deployment Commands

When ready to deploy Firestore configuration:

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

**Important**: Test rules in Firebase Console Rules Playground before deploying to production!

---

## Database Schema Reference

Quick reference for database structure:

### Collections:
- **users** - User accounts and profiles
- **businesses** - Connected Google Business locations
- **reviews** - Customer reviews and AI replies
- **subscriptions** - Stripe subscription records

### Limits by Tier:
| Tier | Businesses | Reviews/Month | Auto-Post |
|------|-----------|---------------|-----------|
| Free | 1 | 10 | ❌ |
| Basic | 3 | 100 | ✅ |
| Pro | 10 | 500 | ✅ |
| Enterprise | ∞ | ∞ | ✅ |

See [types/database.ts](types/database.ts) for complete schema definitions.
