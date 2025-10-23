# Google Review AI Reply - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Routes](#api-routes)
8. [AI Integration](#ai-integration)
9. [External Integrations](#external-integrations)
10. [Component Structure](#component-structure)
11. [State Management](#state-management)
12. [Styling & Design](#styling--design)
13. [Development Conventions](#development-conventions)
14. [Deployment & Configuration](#deployment--configuration)

---

## Project Overview

### Purpose
**Google Review AI Reply** is an intelligent SaaS application that automates responses to Google Business Profile reviews using AI. The system generates contextually appropriate, personalized replies in Hebrew or English based on business configuration, review sentiment, and rating.

### Target Audience
- Small to medium business owners in Israel
- Multi-location businesses
- Businesses wanting to maintain consistent, professional review responses
- Companies looking to save time on review management

### Key Value Propositions
- **Automated AI-powered responses** using Google Gemini 1.5 Flash
- **Multi-language support** (Hebrew/English with auto-detection)
- **Customizable tone and style** per business and star rating
- **Review approval workflow** before posting to Google
- **Multi-business management** from a single dashboard
- **Tiered subscription plans** with Stripe integration

### Primary Language
The application is primarily in **Hebrew (RTL)** with support for English content, catering to the Israeli market.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5
- **React**: 19.1.0 (with React Server Components)
- **Styling**:
  - Tailwind CSS 4
  - CSS Variables for theming
  - RTL support with Hebrew fonts (Rubik, Assistant)
- **UI Components**:
  - Radix UI primitives (@radix-ui/react-*)
  - Custom components with shadcn/ui pattern
  - Lucide React icons
- **Forms**: React Hook Form 7.65.0 + Zod 3.25.76 validation
- **Notifications**: Sonner 2.0.7
- **Date Handling**: date-fns 4.1.0 + date-fns-tz 3.2.0

### Backend
- **Firebase Services**:
  - Firebase Auth (Google OAuth)
  - Cloud Firestore (NoSQL database)
  - Cloud Functions (serverless triggers)
- **AI**: Google Gemini 1.5 Flash (@google/generative-ai 0.24.1)
- **Payments**: Stripe 19.1.0 (@stripe/stripe-js 8.1.0)
- **Google APIs**:
  - Google Business Profile API
  - googleapis 164.1.0
  - google-auth-library 10.4.1

### Development Tools
- **Package Manager**: Yarn 1.22.22
- **Linting**: ESLint 9 with Next.js config
- **Build**: Next.js with Turbopack (dev mode)
- **Deployment**: Firebase Hosting + Functions

### Key Dependencies
```json
{
  "next": "15.5.6",
  "react": "19.1.0",
  "firebase": "12.4.0",
  "firebase-admin": "13.5.0",
  "@google/generative-ai": "0.24.1",
  "googleapis": "164.1.0",
  "stripe": "19.1.0",
  "tailwindcss": "^4"
}
```

---

## Architecture

### Project Structure
```
google-review-ai-reply/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── (dashboard)/              # Dashboard route group (legacy)
│   │   ├── billing/              # Billing management
│   │   ├── businesses/           # Business list
│   │   ├── layout.tsx            # Dashboard shell
│   │   └── reviews/              # Reviews list
│   ├── dashboard/                # New business-scoped routes
│   │   ├── [userId]/
│   │   │   ├── [businessId]/
│   │   │   │   ├── configuration/    # Business config
│   │   │   │   └── reviews/          # Business reviews
│   │   │   └── settings/             # User settings
│   │   └── layout.tsx            # Business-scoped layout
│   ├── api/                      # API routes
│   │   ├── google/               # Google integrations
│   │   │   ├── auth/             # OAuth initiation
│   │   │   ├── callback/         # OAuth callback
│   │   │   ├── disconnect/       # Disconnect Google
│   │   │   ├── locations/        # Fetch locations
│   │   │   └── notifications/    # Pub/Sub setup
│   │   ├── reviews/              # Review actions
│   │   │   └── [id]/             # Review operations
│   │   ├── stripe/               # Stripe integration
│   │   └── webhooks/             # Webhook handlers
│   ├── favicon.ico
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific
│   │   ├── BusinessCard.tsx
│   │   ├── BusinessConfigForm.tsx
│   │   ├── BusinessLimitBanner.tsx
│   │   ├── BusinessSelector.tsx
│   │   ├── BusinessToggler.tsx
│   │   ├── EmptyBusinessState.tsx
│   │   ├── ReplyEditor.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewFilters.tsx
│   │   ├── StarConfigAccordion.tsx
│   │   └── settings/
│   │       └── DangerZone.tsx
│   ├── landing/                  # Landing page sections
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Pricing.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Sidebar.tsx
│   └── ui/                       # Reusable UI primitives
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...                   # 20+ shadcn components
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Firebase Auth state
│   └── BusinessContext.tsx       # Selected business state
│
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── api/                  # HTTP functions
│   │   ├── scheduled/            # Cron jobs
│   │   ├── services/             # Shared services
│   │   │   └── autoPost.ts       # Auto-post logic
│   │   ├── triggers/             # Firestore triggers
│   │   │   ├── onReviewCreated.ts    # AI reply generation
│   │   │   └── onReviewNotification.ts
│   │   └── index.ts              # Function exports
│   ├── package.json
│   └── tsconfig.json
│
├── lib/                          # Utility libraries
│   ├── ai/
│   │   ├── gemini.ts             # Gemini AI client
│   │   └── prompts.ts            # Prompt engineering
│   ├── billing/                  # Stripe helpers
│   ├── firebase/
│   │   ├── admin.ts              # Admin SDK (server)
│   │   ├── admin-users.ts
│   │   ├── auth.ts               # Client auth
│   │   ├── businesses.ts         # Business CRUD
│   │   ├── config.ts             # Firebase config
│   │   ├── reviews.ts            # Review CRUD
│   │   ├── subscriptions.ts      # Subscription logic
│   │   └── users.ts              # User CRUD
│   ├── google/
│   │   ├── business-profile.ts   # Google Business API
│   │   ├── notifications.ts      # Pub/Sub setup
│   │   └── oauth.ts              # OAuth flow
│   ├── reviews/
│   │   └── actions.ts            # Review actions
│   ├── stripe/                   # Stripe integration
│   ├── utils/                    # Generic utils
│   ├── utils.ts                  # cn() helper
│   └── validation/
│       └── database.ts           # Zod schemas
│
├── types/                        # TypeScript types
│   ├── database.ts               # Firestore types
│   └── index.ts                  # Global types
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts
│
├── public/                       # Static assets
│
├── components.json               # shadcn/ui config
├── eslint.config.mjs             # ESLint config
├── firebase.json                 # Firebase config
├── firestore.indexes.json        # Firestore indexes
├── firestore.rules               # Security rules
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js config
├── package.json
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── yarn.lock
```

### Architectural Patterns

#### 1. **Route Groups** (`app/` directory)
- `(auth)` - Authentication pages without layout
- `(dashboard)` - Dashboard pages with shared layout
- `dashboard/[userId]/[businessId]` - Business-scoped routes with dynamic params

#### 2. **Server vs Client Components**
- **Server Components** (default): Landing pages, layouts
- **Client Components** (`'use client'`): Interactive dashboard, forms, auth

#### 3. **Context Providers**
- `AuthContext` - Global Firebase auth state
- `BusinessContext` - Currently selected business (persisted to localStorage)

#### 4. **API Route Structure**
- `/api/google/*` - Google Business Profile integration
- `/api/reviews/[id]/*` - Review management actions
- `/api/stripe/*` - Payment processing
- `/api/webhooks/*` - External service webhooks

#### 5. **Firebase Functions**
- **Triggers**: Firestore document lifecycle events
- **Scheduled**: Cron-based jobs
- **HTTP**: Callable functions from frontend

#### 6. **Data Flow**
```
User Action → Client Component → API Route → Firebase Function → Firestore
                                                      ↓
                                              Gemini AI / Google API
                                                      ↓
                                              Update Firestore
                                                      ↓
                                              Real-time listener → UI Update
```

---

## Core Features

### 1. **User Authentication**
**Location**: [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx)

- Google OAuth sign-in via Firebase Auth
- Automatic Firestore user document creation
- Persistent session management
- Hebrew error messages

**Flow**:
1. User clicks "התחבר עם Google"
2. `signInWithGoogle()` from [lib/firebase/auth.ts](lib/firebase/auth.ts)
3. Firebase creates/updates user document
4. Redirect to `/businesses`

### 2. **Business Management**
**Location**: [components/dashboard/](components/dashboard/)

#### Features:
- **Connect Google Business Profile** - OAuth flow to access Google locations
- **Multi-business support** - Manage multiple locations from one account
- **Business toggler** - Quick switch between businesses (BusinessToggler.tsx)
- **Configuration per business** - Customizable AI settings

#### Business Configuration Options:
- Business name override
- Business description (for AI context)
- Contact phone (for negative review responses)
- Tone of voice: friendly/formal/humorous/professional
- Language mode: hebrew/english/auto-detect/match-reviewer
- Use emojis (with whitelist)
- Max sentences per reply (default: 2)
- Custom signature line
- Auto-post vs. manual approval
- **Star-specific configs** (1-5 stars):
  - Enable/disable AI for each rating
  - Custom instructions per rating

**Configuration Form**: [components/dashboard/BusinessConfigForm.tsx](components/dashboard/BusinessConfigForm.tsx:1)

### 3. **AI Review Response Generation**
**Location**: [lib/ai/](lib/ai/), [functions/src/triggers/onReviewCreated.ts](functions/src/triggers/onReviewCreated.ts)

#### Process:
1. **Trigger**: New review document created in Firestore
2. **Fetch config**: Load business configuration
3. **Build prompt**: Generate contextual prompt using template
4. **Call Gemini**: Generate reply with Gemini 1.5 Flash
5. **Update Firestore**: Save AI reply to review document
6. **Auto-approve** (optional): If autoPost enabled, mark as approved

#### Prompt Engineering
**Location**: [lib/ai/prompts.ts](lib/ai/prompts.ts)

Key features:
- **Variable replacement**: `{{BUSINESS_NAME}}`, `{{RATING}}`, etc.
- **Contextual instructions**: Different for each star rating
- **Personalization**: Must start with reviewer's name (translated)
- **Tone matching**: Adjusts language based on configuration
- **Length control**: Enforces max sentences
- **Signature**: Auto-appends business signature

Example prompt structure:
```
אתה מודל AI שתפקידו לענות על ביקורות גוגל של {{BUSINESS_NAME}}.

הוראות כלליות:
1. שפה: {{LANGUAGE_INSTRUCTION}}
2. אורך: {{MAX_SENTENCES}} משפטים בלבד
3. פתיחה אישית: כל תגובה חייבת להתחיל בפנייה אישית לשם המבקר
4. טון: {{TONE_DESCRIPTION}}
...
```

### 4. **Review Management Dashboard**
**Location**: [app/dashboard/[userId]/[businessId]/reviews/page.tsx](app/dashboard/[userId]/[businessId]/reviews/page.tsx)

#### Features:
- **Real-time updates** via Firestore listeners
- **Pagination** - Load 20 reviews at a time
- **Status badges**: pending/approved/posted/rejected/failed
- **Action buttons**:
  - ✓ **Approve** - Mark ready for posting
  - ✗ **Reject** - Discard AI reply
  - ✏️ **Edit** - Modify AI-generated reply
  - ↻ **Regenerate** - Generate new AI reply
  - → **Post to Google** - Publish to Google Business Profile

**Review Card Component**: [components/dashboard/ReviewCard.tsx](components/dashboard/ReviewCard.tsx)

### 5. **Review Approval Workflow**

#### Status Flow:
```
pending → approved → posted
   ↓         ↓
rejected  failed
```

- **pending**: AI reply generated, awaiting approval
- **approved**: Ready to post to Google
- **posted**: Successfully published to Google
- **rejected**: User discarded the AI reply
- **failed**: Error during posting

### 6. **Google Business Profile Integration**
**Location**: [lib/google/business-profile.ts](lib/google/business-profile.ts)

#### Capabilities:
- List all Google Business accounts
- Fetch business locations (profiles)
- Get location details (name, address, phone)
- Post review replies
- Delete review replies
- Set up Pub/Sub notifications (for new reviews)

#### API Endpoints:
- **Accounts**: `mybusinessaccountmanagement.v1`
- **Locations**: `mybusinessbusinessinformation.v1`
- **Reviews**: Direct API calls (v4) - reviews.list deprecated

**OAuth Scopes**:
```javascript
'https://www.googleapis.com/auth/business.manage'
```

### 7. **Subscription & Billing**
**Location**: [lib/stripe/](lib/stripe/), [types/database.ts](types/database.ts:142-167)

#### Tiers:
```typescript
free: {
  businesses: 1,
  reviewsPerMonth: 10,
  autoPost: false,
  requireApproval: true
}

basic: {
  businesses: 3,
  reviewsPerMonth: 100,
  autoPost: true
}

pro: {
  businesses: 10,
  reviewsPerMonth: 500
}

enterprise: {
  businesses: Infinity,
  reviewsPerMonth: Infinity
}
```

#### Stripe Integration:
- Webhook handlers in `/api/webhooks/stripe`
- Subscription status tracking in Firestore
- Automatic tier upgrades/downgrades

---

## Database Schema

### Collections

#### 1. **users**
```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  subscriptionTier: "free" | "basic" | "pro" | "enterprise";
  stripeCustomerId?: string;      // Stripe customer ID
  googleRefreshToken?: string;    // Encrypted OAuth token
  selectedBusinessId?: string;    // Currently selected business
  notificationPreferences?: {
    emailOnNewReview: boolean;
    emailOnFailedPost: boolean;
  };
}
```

#### 2. **businesses**
```typescript
{
  id: string;                     // Auto-generated
  userId: string;                 // Owner's UID
  googleAccountId: string;        // Google account ID
  googleLocationId: string;       // Google location ID
  name: string;                   // Business name
  address: string;                // Full address
  photoUrl?: string;              // Business photo
  connected: boolean;             // Connection status
  connectedAt: Timestamp;
  notificationsEnabled?: boolean; // Pub/Sub status
  config: BusinessConfig;         // See below
}
```

#### 3. **BusinessConfig** (nested in business)
```typescript
{
  businessName?: string;          // Override
  businessDescription: string;    // For AI context
  businessPhone?: string;         // Contact for negative reviews

  // AI Configuration
  toneOfVoice: "friendly" | "formal" | "humorous" | "professional";
  useEmojis: boolean;
  languageMode: "hebrew" | "english" | "auto-detect" | "match-reviewer";
  languageInstructions?: string;  // Custom language rules
  maxSentences?: number;          // Default: 2
  allowedEmojis?: string[];       // Whitelist
  signature?: string;             // Business signature
  promptTemplate: string;         // Custom AI prompt

  // Automation
  autoPost: boolean;              // Auto-publish to Google
  requireApproval: boolean;       // Manual review required

  // Star-specific configs
  starConfigs: {
    1: StarConfig;
    2: StarConfig;
    3: StarConfig;
    4: StarConfig;
    5: StarConfig;
  };
}
```

#### 4. **StarConfig**
```typescript
{
  enabled: boolean;               // Generate AI reply for this rating
  customInstructions: string;     // Extra instructions for this rating
}
```

#### 5. **reviews**
```typescript
{
  id: string;
  businessId: string;
  googleReviewId: string;         // Google's review ID
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;                 // 1-5
  reviewText: string;
  reviewDate: Timestamp;          // Review creation date
  receivedAt: Timestamp;          // When we received it

  // AI Reply
  aiReply?: string;               // Generated reply
  aiReplyGeneratedAt?: Timestamp;
  replyStatus: "pending" | "approved" | "rejected" | "posted" | "failed";

  // Posted Reply
  postedReply?: string | null;    // What was actually posted
  postedAt?: Timestamp | null;
  postedBy?: string | null;       // User ID

  // Editing
  wasEdited: boolean;
  editedReply?: string | null;    // User-modified reply
}
```

#### 6. **subscriptions**
```typescript
{
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
}
```

### Firestore Indexes

**Location**: [firestore.indexes.json](firestore.indexes.json)

Required composite indexes:
- `reviews`: `businessId` (ASC) + `receivedAt` (DESC)
- `businesses`: `userId` (ASC) + `connected` (ASC)

---

## Authentication & Authorization

### Firebase Auth Setup
**Location**: [lib/firebase/auth.ts](lib/firebase/auth.ts), [contexts/AuthContext.tsx](contexts/AuthContext.tsx)

#### Features:
- Google OAuth 2.0 sign-in
- Firebase Auth session management
- Automatic user document creation
- Token refresh handling

#### Auth Flow:
```javascript
signInWithGoogle()
  → Firebase popup
  → Get user credentials
  → Check if Firestore user exists
  → Create user document if new
  → Return user object
```

### Firestore Security Rules
**Location**: [firestore.rules](firestore.rules)

#### Key Rules:

**1. Users Collection**
- Users can **read/write** their own document only
- Cannot delete their own document
- Cannot change `uid` or `createdAt`

**2. Businesses Collection**
- Users can **read** businesses they own
- Users can **create** businesses with themselves as owner
- Users can **update** their own businesses (except `userId`)
- Users can **delete** their own businesses

**3. Reviews Collection**
- Users can **read** reviews for businesses they own
- Users/Functions can **create** reviews for owned businesses
- Users/Functions can **update** reviews (status, reply, etc.)
- Reviews **cannot be deleted** (keep for history)

**4. Helper Functions**:
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function ownsBusinessDoc(businessId) {
  return isAuthenticated() &&
    exists(/databases/$(database)/documents/businesses/$(businessId)) &&
    get(/databases/$(database)/documents/businesses/$(businessId)).data.userId == request.auth.uid;
}
```

### Middleware
**Location**: [middleware.ts](middleware.ts)

Currently minimal - auth is handled client-side by `AuthContext`. Protected routes check auth state in their layouts.

---

## API Routes

### Google Integration Routes

#### 1. **GET /api/google/auth**
Initiates Google OAuth flow for Business Profile access.

**Scopes requested**:
- `https://www.googleapis.com/auth/business.manage`

**Returns**: Redirect URL to Google OAuth consent screen

#### 2. **GET /api/google/callback**
OAuth callback handler.

**Query params**: `code`, `state`

**Process**:
1. Exchange code for tokens
2. Store refresh token (encrypted)
3. Redirect to businesses list

#### 3. **POST /api/google/disconnect**
Disconnect Google Business Profile.

**Body**: `{ userId: string }`

**Actions**:
- Revoke OAuth tokens
- Clear refresh token from user document
- Mark all businesses as disconnected

#### 4. **GET /api/google/locations**
Fetch all Google Business locations for authenticated user.

**Headers**: `Authorization: Bearer <firebase-token>`

**Returns**:
```typescript
{
  accounts: GoogleAccount[];
  locations: GoogleLocation[];
}
```

#### 5. **POST /api/google/notifications**
Set up Pub/Sub notifications for new reviews.

**Body**: `{ businessId: string }`

**Actions**:
- Create Pub/Sub topic
- Subscribe to Google Business notifications
- Update business document with notification status

### Review Management Routes

#### 6. **POST /api/reviews/[id]/approve**
Approve AI-generated reply.

**Params**: `id` - Review document ID

**Body**: None

**Updates**: `replyStatus` → `"approved"`

#### 7. **POST /api/reviews/[id]/reject**
Reject AI-generated reply.

**Params**: `id` - Review document ID

**Updates**: `replyStatus` → `"rejected"`

#### 8. **POST /api/reviews/[id]/post**
Post reply to Google Business Profile.

**Params**: `id` - Review document ID

**Process**:
1. Fetch review and business
2. Get Google refresh token
3. Call Google Business Profile API
4. Update review: `replyStatus` → `"posted"`, `postedAt` → now

#### 9. **POST /api/reviews/[id]/regenerate**
Generate new AI reply.

**Params**: `id` - Review document ID

**Process**:
1. Fetch review and business config
2. Build new prompt
3. Call Gemini AI
4. Update review with new `aiReply`
5. Reset `replyStatus` → `"pending"`

### Stripe Routes

#### 10. **POST /api/stripe/create-checkout-session**
Create Stripe checkout session for subscription.

**Body**:
```typescript
{
  priceId: string;
  userId: string;
}
```

**Returns**:
```typescript
{
  sessionId: string;
}
```

#### 11. **POST /api/webhooks/stripe**
Handle Stripe webhook events.

**Events handled**:
- `checkout.session.completed` - Create subscription
- `customer.subscription.updated` - Update subscription
- `customer.subscription.deleted` - Cancel subscription

---

## AI Integration

### Google Gemini Configuration
**Location**: [lib/ai/gemini.ts](lib/ai/gemini.ts)

#### Model: `gemini-1.5-flash`
- Fast and cost-effective
- Low latency for real-time responses
- Supports Hebrew and English

#### Generation Config:
```typescript
{
  temperature: 0.7,      // Balanced creativity
  topP: 0.9,             // Nucleus sampling
  topK: 40,              // Token selection
  maxOutputTokens: 500   // ~2-3 sentences
}
```

#### Functions:

**1. generateReply(prompt, options?)**
```typescript
async function generateReply(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }
): Promise<string>
```

**2. generateReplyWithRetry(prompt, maxRetries=3)**
- Implements exponential backoff
- Retries on API failures
- Useful for production reliability

**3. validateReply(reply, maxSentences)**
- Checks reply length
- Validates sentence count
- Returns boolean

**4. testGeminiConnection()**
- Health check for Gemini API
- Returns true if connection successful

### Prompt Engineering
**Location**: [lib/ai/prompts.ts](lib/ai/prompts.ts)

#### Prompt Template Variables:
```
{{BUSINESS_NAME}}           - Business display name
{{BUSINESS_DESCRIPTION}}    - Context about the business
{{BUSINESS_PHONE}}          - Contact phone (for negative reviews)
{{LANGUAGE_INSTRUCTION}}    - Language rules
{{TONE_DESCRIPTION}}        - Tone of voice description
{{EMOJI_INSTRUCTIONS}}      - Emoji usage rules
{{ALLOWED_EMOJIS_LIST}}     - Whitelist of emojis
{{MAX_SENTENCES}}           - Maximum sentences
{{STAR_RATING}}             - Review rating (1-5)
{{STAR_INSTRUCTIONS}}       - Custom instructions for this rating
{{REVIEWER_NAME}}           - Reviewer's name
{{REVIEW_TEXT}}             - Review content
{{SIGNATURE}}               - Business signature line
```

#### Tone Descriptions:
```typescript
const toneMap = {
  friendly: "חם, ידידותי ומכיל",
  formal: "רשמי, מקצועי ומנומס",
  professional: "מקצועי, ישיר ואמין",
  humorous: "קליל, עם הומור עדין וחיוכים"
};
```

#### Language Instructions:
```typescript
const instructions = {
  hebrew: "עברית בלבד. אין לשלב שפות אחרות בתשובה.",
  english: "English only. Do not mix other languages in the response.",
  "auto-detect": "זהה אוטומטית את שפת הביקורת והשב באותה שפה.",
  "match-reviewer": "התאם את שפת התגובה לשפה שבה כתב המבקר."
};
```

#### Default Prompt Template:
[View full template](lib/ai/prompts.ts:31-65)

Key instructions in the default template:
1. **Personalization**: Must start with reviewer's name (translated to reply language)
2. **Length**: Strict limit on sentences (default: 2)
3. **Content rules**:
   - 5-4 stars: General thanks, no specific details
   - 3 stars: Appreciation + request for feedback
   - 1-2 stars: Apology + phone contact request
4. **Grammar**: Proper Hebrew grammar (gender agreement, etc.)
5. **Signature**: Always end with business signature

#### Function: buildReplyPrompt()
```typescript
function buildReplyPrompt(
  businessConfig: BusinessConfig,
  review: ReviewData,
  businessName: string,
  businessPhone?: string
): string
```

Replaces all template variables and returns the complete prompt ready for Gemini.

---

## External Integrations

### 1. Google Business Profile API
**Location**: [lib/google/business-profile.ts](lib/google/business-profile.ts)

#### Authentication
Uses OAuth 2.0 with refresh tokens stored in Firestore (encrypted).

**Scopes**:
```javascript
'https://www.googleapis.com/auth/business.manage'
```

#### Key Functions:

**getAccounts(refreshToken)**
```typescript
async function getAccounts(refreshToken: string): Promise<GoogleAccount[]>
```
Fetches all Google Business accounts user has access to.

**getLocations(refreshToken, accountName)**
```typescript
async function getLocations(
  refreshToken: string,
  accountName: string
): Promise<GoogleLocation[]>
```
Fetches all business locations for an account.

**getAllLocations(refreshToken)**
```typescript
async function getAllLocations(
  refreshToken: string
): Promise<Array<GoogleLocation & { accountId: string }>>
```
Fetches all locations across all accounts (used in business setup).

**postReviewReply(refreshToken, reviewName, replyText)**
```typescript
async function postReviewReply(
  refreshToken: string,
  reviewName: string,
  replyText: string
): Promise<void>
```
Posts reply to a Google review. Uses direct API call:
```
PUT https://mybusiness.googleapis.com/v4/{reviewName}/reply
```

**deleteReviewReply(refreshToken, reviewName)**
```typescript
async function deleteReviewReply(
  refreshToken: string,
  reviewName: string
): Promise<void>
```

#### Error Handling:
- 429 (Rate Limit): Hebrew message to wait
- 403 (Forbidden): Check API permissions
- 404 (Not Found): Review doesn't exist

### 2. Google Pub/Sub (Review Notifications)
**Location**: [lib/google/notifications.ts](lib/google/notifications.ts)

#### Purpose
Receive real-time notifications when new reviews are posted.

#### Setup Process:
1. Create Cloud Pub/Sub topic
2. Create subscription to topic
3. Call Google Business Profile API to enable notifications
4. Google sends review events to Pub/Sub
5. Cloud Function triggered on new message
6. Function creates review document in Firestore

#### Topic Structure:
```
projects/{project-id}/topics/review-notifications-{businessId}
```

### 3. Stripe Payments
**Location**: [lib/stripe/](lib/stripe/)

#### Features:
- Subscription management (create, update, cancel)
- Webhook handling for subscription events
- Customer portal for self-service
- Price/Plan management

#### Subscription Flow:
1. User clicks upgrade button
2. Frontend calls `/api/stripe/create-checkout-session`
3. Redirect to Stripe Checkout
4. User completes payment
5. Stripe webhook → Update Firestore subscription
6. Update user's `subscriptionTier`

#### Price IDs (configured in Stripe):
```typescript
prices = {
  basic: "price_xxx",
  pro: "price_yyy",
  enterprise: "price_zzz"
}
```

---

## Component Structure

### UI Component Library
**Location**: [components/ui/](components/ui/)

Built with **Radix UI** + **Tailwind CSS** following the **shadcn/ui** pattern.

#### Available Components:
- `accordion` - Collapsible sections
- `alert` - Notification messages
- `avatar` - User/business photos
- `badge` - Status indicators
- `button` - Primary actions
- `card` - Content containers
- `dialog` - Modal dialogs
- `dropdown-menu` - Contextual menus
- `input` - Form inputs
- `label` - Form labels
- `scroll-area` - Scrollable containers
- `select` - Dropdown selects
- `separator` - Visual dividers
- `sheet` - Slide-out panels
- `skeleton` - Loading placeholders
- `sonner` - Toast notifications
- `switch` - Toggle switches
- `tabs` - Tabbed interfaces
- `textarea` - Multi-line inputs
- `StarRating` - Custom star display

#### Configuration:
**File**: [components.json](components.json)
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  }
}
```

### Dashboard Components

#### 1. **ReviewCard** ([components/dashboard/ReviewCard.tsx](components/dashboard/ReviewCard.tsx))
Displays a single review with:
- Reviewer info (name, photo, rating)
- Review text
- AI-generated reply
- Status badge
- Action buttons (approve, reject, edit, post, regenerate)
- Reply editor modal

**Props**:
```typescript
{
  review: Review;
  onUpdate?: () => void;
}
```

#### 2. **BusinessConfigForm** ([components/dashboard/BusinessConfigForm.tsx](components/dashboard/BusinessConfigForm.tsx))
Comprehensive form for business AI configuration:
- Business info (name, description, phone)
- AI settings (tone, language, emojis, max sentences)
- Automation settings (auto-post, require approval)
- Star-specific configurations (5 accordions)
- Custom prompt template

**Uses**:
- React Hook Form
- Zod validation
- Nested form fields
- Real-time Firestore updates

#### 3. **BusinessToggler** ([components/dashboard/BusinessToggler.tsx](components/dashboard/BusinessToggler.tsx))
Quick business switcher in the sidebar:
- Dropdown menu with all businesses
- Current business indicator
- Persists selection to BusinessContext

#### 4. **ReplyEditor** ([components/dashboard/ReplyEditor.tsx](components/dashboard/ReplyEditor.tsx))
Modal dialog for editing AI replies:
- Textarea with AI reply
- Character counter
- Save/Cancel buttons
- Updates `editedReply` and `wasEdited` fields

#### 5. **StarConfigAccordion** ([components/dashboard/StarConfigAccordion.tsx](components/dashboard/StarConfigAccordion.tsx))
Accordion for configuring AI settings per star rating:
- Enable/disable AI generation
- Custom instructions textarea
- Saved per star (1-5)

### Landing Page Components
**Location**: [components/landing/](components/landing/)

#### Structure:
```typescript
<Header />      // Navigation, logo, CTA
<Hero />        // Headline, subheadline, main CTA
<Features />    // Feature cards (AI, multi-business, etc.)
<HowItWorks />  // Step-by-step explanation
<Pricing />     // Subscription tier cards
<FAQ />         // Accordion with common questions
<Footer />      // Links, copyright
```

All components are **server components** (no 'use client') for optimal performance.

### Layout Components
**Location**: [components/layout/](components/layout/)

#### 1. **Sidebar** ([components/layout/Sidebar.tsx](components/layout/Sidebar.tsx))
Main navigation for dashboard:
- Business toggler
- Navigation links (Reviews, Configuration, Settings)
- User profile dropdown
- Sign out button

#### 2. **Header** ([components/layout/Header.tsx](components/layout/Header.tsx))
Top bar for dashboard:
- Breadcrumbs
- Mobile menu toggle
- Business name display

#### 3. **MobileMenu** ([components/layout/MobileMenu.tsx](components/layout/MobileMenu.tsx))
Sheet component for mobile navigation:
- Same content as Sidebar
- Slide-out from right (RTL adjusted)

---

## State Management

### 1. AuthContext
**Location**: [contexts/AuthContext.tsx](contexts/AuthContext.tsx)

#### Purpose
Manages Firebase Authentication state globally.

#### Interface:
```typescript
interface AuthContextType {
  user: User | null;        // Firebase user object
  loading: boolean;         // Auth initialization loading
  error: string | null;     // Auth error message
}
```

#### Usage:
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <Dashboard />;
}
```

#### Implementation:
- Wraps entire app in [app/layout.tsx](app/layout.tsx)
- Uses `onAuthStateChanged` listener
- Automatically updates on login/logout

### 2. BusinessContext
**Location**: [contexts/BusinessContext.tsx](contexts/BusinessContext.tsx)

#### Purpose
Manages currently selected business and business list.

#### Interface:
```typescript
interface BusinessContextType {
  currentBusiness: Business | null;     // Currently selected
  businesses: Business[];                // All user's businesses
  selectedBusinessId: string | null;     // Selected ID
  selectBusiness: (id: string) => void;  // Change selection
  clearBusiness: () => void;             // Clear selection
  loading: boolean;                      // Data loading
  refreshBusinesses: () => Promise<void>; // Reload from Firestore
}
```

#### Features:
- **Persistence**: Saves `selectedBusinessId` to localStorage
- **Auto-select**: Selects first business if none selected
- **Validation**: Ensures selected business exists and is connected
- **Real-time**: Loads from Firestore when user changes

#### Usage:
```typescript
import { useBusiness } from '@/contexts/BusinessContext';

function Component() {
  const { currentBusiness, selectBusiness } = useBusiness();

  return (
    <div>
      <h1>{currentBusiness?.name}</h1>
      <button onClick={() => selectBusiness('other-id')}>
        Switch Business
      </button>
    </div>
  );
}
```

#### Implementation:
- Wraps dashboard in [app/dashboard/layout.tsx](app/dashboard/layout.tsx)
- Loads businesses on user authentication
- Updates current business when `selectedBusinessId` changes

### Data Flow Summary

```
User Login
  ↓
AuthContext updates (user object)
  ↓
BusinessContext loads businesses
  ↓
Auto-select first business OR load from localStorage
  ↓
BusinessContext updates (currentBusiness)
  ↓
Dashboard pages render with current business
  ↓
User actions → API calls → Firestore updates
  ↓
Real-time listeners → State updates → UI re-renders
```

---

## Styling & Design

### Tailwind CSS Configuration
**Location**: [tailwind.config.ts](tailwind.config.ts)

#### Theme Extensions:
```typescript
{
  colors: {
    // CSS Variables for theming
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: "hsl(var(--primary))",
    // ... 20+ semantic color tokens
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)"
  },
  fontFamily: {
    sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
    assistant: ["var(--font-assistant)", "system-ui", "sans-serif"]
  }
}
```

#### Content Paths:
```typescript
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}"
]
```

#### Dark Mode:
```typescript
darkMode: "class"  // Enable class-based dark mode
```

### Global Styles
**Location**: [app/globals.css](app/globals.css)

#### CSS Variables (Design Tokens):
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
    --radius: 0.5rem;
  }
}
```

#### RTL Support:
```css
[dir="rtl"] {
  /* RTL-specific adjustments */
}
```

### Typography
**Location**: [app/layout.tsx](app/layout.tsx:2-16)

#### Hebrew Fonts:
- **Primary**: Rubik (variable font)
- **Secondary**: Assistant (variable font)
- Both support Hebrew and Latin subsets

```typescript
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap"
});
```

#### Application:
```html
<html lang="he" dir="rtl">
  <body className={`${rubik.variable} ${assistant.variable} font-sans`}>
```

### Design System

#### Color Palette:
- **Primary**: Blue (#4F46E5) - CTAs, links
- **Secondary**: Slate - Backgrounds, borders
- **Success**: Green - Posted reviews
- **Warning**: Yellow - Pending reviews
- **Destructive**: Red - Rejected/failed reviews

#### Spacing Scale:
Tailwind default (0.25rem increments)

#### Component Styling:
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Solid, outline, ghost variants
- **Inputs**: Bordered, focus ring
- **Badges**: Small, rounded, colored by status

#### Responsive Breakpoints:
```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Utility Classes

#### Custom Utilities:
```typescript
// In components
className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "default" && "default-variant-classes"
)}
```

#### cn() Helper:
**Location**: [lib/utils.ts](lib/utils.ts)
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combines clsx (conditional classes) + tailwind-merge (dedupes Tailwind classes).

---

## Development Conventions

### File Naming
- **Components**: PascalCase (e.g., `ReviewCard.tsx`)
- **Utilities**: camelCase (e.g., `business-profile.ts`)
- **Pages**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Types**: PascalCase (e.g., `database.ts` exports `Review`, `Business`)

### Component Structure

#### Client Components:
```typescript
'use client';

import { useState } from 'react';

interface Props {
  // Props interface
}

export function ComponentName({ prop }: Props) {
  const [state, setState] = useState();

  // Event handlers
  const handleAction = () => {};

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Server Components:
```typescript
// No 'use client' directive

import { ServerComponent } from '@/components/ServerComponent';

export default function Page() {
  return (
    <div>
      <ServerComponent />
    </div>
  );
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate input
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Missing field' }, { status: 400 });
    }

    // 4. Perform action
    const result = await performAction(body);

    // 5. Return success
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Firebase Function Pattern

```typescript
import * as functions from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

export const onDocumentCreated = functions.onDocumentCreated(
  'collection/{docId}',
  async (event) => {
    try {
      const data = event.data?.data();
      const docId = event.params.docId;

      logger.info(`Processing document: ${docId}`);

      // Perform action
      await processData(data);

      // Update document
      await admin.firestore()
        .collection('collection')
        .doc(docId)
        .update({ processed: true });

      logger.info('Processing complete');

    } catch (error) {
      logger.error('Error processing document:', error);
      throw error;
    }
  }
);
```

### Error Handling

#### Client-side:
```typescript
try {
  const result = await apiCall();
  toast({
    title: "הצלחה",
    description: "הפעולה בוצעה בהצלחה"
  });
} catch (error) {
  toast({
    title: "שגיאה",
    description: error instanceof Error ? error.message : "אירעה שגיאה",
    variant: "destructive"
  });
}
```

#### Server-side:
```typescript
// Hebrew error messages for user-facing errors
throw new Error("לא ניתן לטעון את הביקורות");

// English for internal errors
console.error("Error fetching reviews:", error);
```

### TypeScript Best Practices

#### Type Imports:
```typescript
import type { NextConfig } from "next";
import type { User } from "@/types/database";
```

#### Interface Naming:
- Props: `ComponentNameProps`
- Context: `ContextNameType`
- API Response: `ApiResponseName`

#### Strict Mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Code Organization

#### Imports Order:
1. External libraries (React, Next.js)
2. Internal modules (@/components, @/lib)
3. Types (@/types)
4. Styles (if any)

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import type { Review } from '@/types/database';
```

#### Export Pattern:
- Default export for pages and main components
- Named exports for utilities and helpers

### Git Commit Conventions

Based on git log:
```
feat: Add new feature
fix: Bug fix
refactor: Code refactoring
docs: Documentation updates
style: Code style changes
chore: Build/config changes
```

---

## Deployment & Configuration

### Environment Variables

#### Required Variables:

**Frontend (.env.local)**:
```bash
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
```

**Backend (Firebase Functions)**:
```bash
# Firebase Admin (auto-configured in Cloud Functions)
FIREBASE_CONFIG=auto

# Google Gemini AI
GEMINI_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://domain.com/api/google/callback
```

### Firebase Configuration

#### 1. **Initialize Firebase Project**
```bash
firebase init
```

Select:
- Firestore
- Functions
- Hosting

#### 2. **Firestore Setup**
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

#### 3. **Functions Deployment**
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

#### 4. **Hosting Deployment**
```bash
npm run build
firebase deploy --only hosting
```

### Google Cloud Configuration

#### 1. **Enable APIs**
In Google Cloud Console:
- Google Business Profile API
- Cloud Pub/Sub API
- Cloud Functions API
- Cloud Firestore API

#### 2. **OAuth Consent Screen**
- Configure consent screen
- Add scopes: `business.manage`
- Add test users (for development)

#### 3. **Service Account**
For Cloud Functions:
- Create service account
- Grant Firestore/Pub/Sub permissions
- Download credentials (auto-used in Cloud Functions)

### Stripe Configuration

#### 1. **Products & Prices**
Create products in Stripe Dashboard:
- Basic: $XX/month
- Pro: $XX/month
- Enterprise: $XX/month

Copy Price IDs to environment variables.

#### 2. **Webhooks**
Add webhook endpoint:
```
https://your-domain.com/api/webhooks/stripe
```

Select events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy webhook secret to `STRIPE_WEBHOOK_SECRET`.

### Next.js Build Configuration

**Location**: [next.config.ts](next.config.ts)

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};
```

### Development Scripts

```bash
# Development
yarn dev              # Start dev server (Turbopack)

# Build
yarn build            # Production build

# Start
yarn start            # Start production server

# Lint
yarn lint             # Run ESLint
```

### Production Checklist

Before deploying:
- [ ] Set all environment variables in Firebase/Vercel
- [ ] Deploy Firestore rules and indexes
- [ ] Deploy Cloud Functions
- [ ] Configure Stripe webhook URL
- [ ] Set up Google OAuth redirect URI
- [ ] Enable required Google Cloud APIs
- [ ] Test OAuth flow end-to-end
- [ ] Test Stripe subscription flow
- [ ] Test AI reply generation
- [ ] Test review posting to Google

---

## Summary

This project is a comprehensive **AI-powered SaaS application** for managing Google Business Profile reviews. It combines:

- **Modern Web Stack**: Next.js 15, React 19, TypeScript, Tailwind
- **Firebase Backend**: Auth, Firestore, Cloud Functions
- **AI Integration**: Google Gemini for intelligent reply generation
- **External APIs**: Google Business Profile, Stripe payments
- **Hebrew-First Design**: RTL support, Hebrew fonts, localized UI
- **Multi-tenant**: Support for multiple businesses per user
- **Scalable Architecture**: Serverless functions, real-time database

### Key Technical Highlights

1. **Prompt Engineering**: Sophisticated prompt templating with variable replacement and context-aware instructions
2. **OAuth Flow**: Secure Google Business Profile integration with refresh token management
3. **Real-time Updates**: Firestore listeners for instant UI updates
4. **Type Safety**: Full TypeScript coverage with strict mode
5. **Security**: Comprehensive Firestore rules and auth validation
6. **Subscription Model**: Tiered plans with usage limits
7. **Responsive Design**: Mobile-first with RTL support
8. **Developer Experience**: Hot reload, type checking, organized structure

### Development Workflow

```
Local Development
  ↓
Git Commit (conventional commits)
  ↓
Push to GitHub
  ↓
Deploy to Firebase/Vercel
  ↓
Stripe/Google Webhooks → Production
```

---

**Last Updated**: 2025
**Tech Stack Version**: Next.js 15.5.6, React 19.1.0, Firebase 12.4.0
**Author**: Documented by AI based on codebase analysis
