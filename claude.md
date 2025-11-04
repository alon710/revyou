# Revyou - Google Review AI Reply

> **AI-Powered Google Business Review Management SaaS Platform**

## Project Overview

**Revyou** (formerly "Google Review AI Reply") is a comprehensive SaaS application that helps businesses manage and respond to Google Business Profile reviews using AI-powered reply generation. The platform integrates with Google Business Profile API, uses Google Gemini AI for generating contextual replies, and provides subscription-based access with Stripe payment processing.

### Quick Facts

- **Project Name**: Revyou
- **Firebase Project ID**: review-ai-reply
- **Firebase Project Number**: 595883094755
- **Primary Language**: TypeScript
- **Package Manager**: Yarn 1.22.22
- **Version**: 0.1.0

---

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.6 with App Router
- **React**: 19.1.0 (latest)
- **UI Components**:
  - Shadcn/ui (built on Radix UI primitives)
  - Tailwind CSS 4.1.16
- **State Management**:
  - Zustand 5.0.8 (global UI state)
  - React Context (AuthContext, BusinessContext)
- **Data Visualization**: Recharts 2.15.4
- **Animation**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.552.0, Radix UI Icons
- **Notifications**: Sonner (toast notifications)
- **Styling**: PostCSS, Tailwind CSS with custom configuration

### Backend & Services

- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Auth with Google OAuth 2.0
- **Serverless Functions**: Cloud Functions for Firebase (Node.js 22)
- **AI Integration**: Google Generative AI (Gemini) 0.24.1
- **Payment Processing**: Stripe via Firestore Stripe Payments Extension
- **Email Service**: Resend 6.3.0 (transactional emails)
- **Google APIs**:
  - Google Auth Library 10.4.1
  - Google Business Profile API

### Development Tools

- **Language**: TypeScript 5.9.3 (strict mode)
- **Linting**: ESLint 9
- **Formatting**: Prettier 3.6.2
- **Code Quality**: Knip 5.66.3 (unused code detection)
- **Build Tool**: Next.js with Turbopack support

### Firebase Extensions

1. **firestore-stripe-payments** (v0.3.12) - Subscription management, checkout, webhooks
2. **firestore-send-email** (v0.2.4) - Automated transactional email sending

---

## Project Structure

```
/Users/alonb/code/google-review-ai-reply/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Auth layout group
│   │   └── login/                # Login page
│   ├── (checkout)/               # Checkout layout group
│   │   └── checkout/             # Stripe checkout page
│   ├── (landing)/                # Landing page layout group
│   │   └── page.tsx              # Home/landing page
│   ├── api/                      # Next.js API routes
│   │   ├── auth/                 # Session management
│   │   ├── google/               # Google OAuth & Business API
│   │   └── reviews/              # Review operations
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── page.tsx              # Dashboard home (stats)
│   │   ├── businesses/           # Business management
│   │   ├── reviews/              # Review list & details
│   │   └── settings/             # Account & subscription settings
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── auth/                     # Authentication UI
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── businesses/           # Business management UI
│   │   ├── charts/               # Data visualization components
│   │   ├── reviews/              # Review display/editing
│   │   ├── settings/             # Settings UI
│   │   ├── shared/               # Shared dashboard utilities
│   │   └── utils/                # Dashboard utility components
│   ├── landing/                  # Landing page sections
│   ├── layout/                   # Layout components (header, footer, etc.)
│   └── ui/                       # Shadcn/ui components
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # User authentication state
│   └── BusinessContext.tsx       # Selected business state
│
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── functions/            # Function implementations
│   │   │   └── onReviewCreate.ts # Main review handler
│   │   ├── email-templates/      # Email HTML templates
│   │   └── shared/               # Shared code with main app
│   ├── package.json              # Functions dependencies
│   └── tsconfig.json             # Functions TypeScript config
│
├── hooks/                        # Custom React hooks
│   ├── useDashboardStats.ts      # Dashboard statistics
│   ├── useReviews.ts             # Review data management
│   └── useNavigation.ts          # Navigation utilities
│
├── lib/                          # Core libraries & services
│   ├── ai/                       # AI integration
│   │   ├── gemini.ts             # Gemini client
│   │   ├── prompts/              # Prompt templates
│   │   └── core/                 # AI utilities
│   ├── api/                      # API utilities
│   ├── firebase/                 # Firebase services
│   │   ├── auth.ts               # Authentication operations
│   │   ├── business.ts           # Business operations
│   │   ├── reviews.ts            # Review operations
│   │   └── users.ts              # User operations
│   ├── google/                   # Google APIs integration
│   │   ├── auth.ts               # OAuth flow
│   │   └── business-profile.ts   # Business Profile API
│   ├── reviews/                  # Review management logic
│   ├── store/                    # Zustand state management
│   ├── stripe/                   # Stripe integration
│   │   ├── client.ts             # Stripe client
│   │   ├── entitlements.ts       # Feature entitlements
│   │   └── feature-config.ts     # Feature flags
│   ├── subscription/             # Subscription logic
│   └── validation/               # Data validation (Zod)
│
├── types/                        # TypeScript type definitions
│   └── database.ts               # Core database types
│
├── constants/                    # Application constants
│   └── dashboardConstants.ts     # Dashboard configuration
│
├── public/                       # Static assets
├── scripts/                      # Database seeding & utilities
│   ├── seed-database.ts          # Main seeding script
│   └── seed-review.ts            # Review seeding
│
├── extensions/                   # Firebase extensions configuration
├── firebase.json                 # Firebase configuration
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore composite indexes
├── .firebaserc                   # Firebase project aliases
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
└── README.md                     # Setup documentation
```

---

## Core Features

### 1. Authentication & User Management

- **Google OAuth 2.0** integration for user login
- Firebase Authentication for session management
- Encrypted OAuth token storage using `@hapi/iron`
- API route-based session handling
- User profile with Stripe customer integration

### 2. Multi-Business Management

- Connect multiple Google Business Profile accounts per user
- Sync business data from Google Business Profile API
- Per-business configuration and settings
- Business selection context throughout the app
- Support for:
  - Business name, address, phone, website
  - Business description and photos
  - Email notifications toggle

### 3. AI-Powered Review Reply Generation

**Google Gemini Integration** for contextual reply generation with:

- **Customizable AI Preferences** (per business):
  - `toneOfVoice`: friendly, formal, humorous, professional
  - `languageMode`: Hebrew, English, auto-detect
  - `useEmojis`: Enable/disable emoji usage
  - `maxSentences`: Limit reply length
  - `allowedEmojis`: Custom emoji whitelist
  - `signature`: Custom signature for all replies

- **Per-Star-Rating Configuration**:
  - Custom instructions for 1-5 star reviews
  - Auto-reply toggle for each rating level

- **Automated Processing**:
  - Cloud Function triggered on new review creation
  - Automatic AI reply generation
  - Optional auto-posting based on star rating
  - Error handling and retry logic

### 4. Review Management

- Automatic review ingestion from Google Business Profile
- Review display with:
  - Reviewer name and photo
  - Star rating (1-5)
  - Review text and date
  - AI-generated reply
- Review status tracking:
  - `pending`: Awaiting action
  - `rejected`: User rejected AI reply
  - `posted`: Successfully posted to Google
  - `failed`: Failed to post
- Manual review editing and approval
- One-click posting to Google Business Profile

### 5. Subscription & Payment Management

**Stripe Integration** via Firebase Extension:

- **Subscription Tiers**:
  - **Free**: Limited features for trial
  - **Basic**: Standard business use
  - **Professional**: Advanced features

- **Feature Flags** (configured in Stripe metadata):
  - `max_businesses`: Number of businesses allowed
  - `monthly_reviews`: Reviews per month limit
  - `manual_approval`: Require manual approval
  - `auto_publish`: Enable auto-publishing
  - `whatsapp_support`: Premium support access

- **Billing Periods**:
  - Monthly subscriptions
  - Yearly subscriptions (discounted)

- **Payment Flow**:
  - Stripe Checkout integration
  - Customer portal for subscription management
  - Webhook handling for subscription events
  - Usage tracking and limits enforcement

### 6. Dashboard & Analytics

**Real-time Statistics**:
- Total reviews count
- Average rating across all reviews
- Pending replies count
- Active businesses count

**Data Visualizations** (Recharts):
- Reply status distribution (pie chart)
- Star rating distribution (bar chart)
- Review trends over time

**Business Management**:
- Add/remove businesses
- Configure AI preferences
- View business-specific analytics

### 7. Email Notifications

- **Review Received Notifications** via Resend
- React Email templating system
- Customizable email templates with Mustache
- Automated sending via Firebase extension
- Per-business email preferences

---

## Database Schema (Firestore)

### Collections Overview

- `users/` - User accounts and profiles
- `products/` - Stripe product/pricing data (managed by extension)
- `accounts/` - OAuth account connections

### Detailed Schema

#### `users/{userId}`

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName: string;            // User display name
  photoURL?: string;              // Profile photo URL
  createdAt: Timestamp;           // Account creation time
  stripeId?: string;              // Stripe customer ID
  stripeLink?: string;            // Stripe portal link
  googleRefreshToken?: string;    // Encrypted OAuth refresh token
  selectedBusinessId?: string;    // Currently selected business ID
}
```

**Subcollections**:
- `subscriptions/{subscriptionId}` - Stripe subscriptions (extension managed)
- `checkout_sessions/{sessionId}` - Stripe checkout sessions (extension managed)
- `payments/{paymentId}` - Payment history (extension managed)

#### `users/{userId}/businesses/{businessId}`

```typescript
{
  id: string;                     // Document ID
  googleAccountId: string;        // Google account ID
  googleBusinessId: string;       // Google Business Profile ID
  name: string;                   // Business name
  address: string;                // Business address
  phoneNumber?: string;           // Phone number
  websiteUrl?: string;            // Website URL
  mapsUrl?: string;               // Google Maps URL
  description?: string;           // Business description
  photoUrl?: string;              // Business photo URL
  connected: boolean;             // Connection status
  connectedAt: Timestamp;         // Connection timestamp
  emailOnNewReview: boolean;      // Send email notifications
  config: BusinessConfig;         // AI configuration (see below)
}
```

##### `BusinessConfig` Structure

```typescript
{
  name: string;                   // Business name for prompts
  description?: string;           // Business description
  phoneNumber?: string;           // Contact phone

  // AI Preferences
  toneOfVoice: 'friendly' | 'formal' | 'humorous' | 'professional';
  useEmojis: boolean;             // Enable emoji usage
  languageMode: 'hebrew' | 'english' | 'auto-detect';
  languageInstructions?: string;  // Custom language instructions
  maxSentences?: number;          // Max reply length
  allowedEmojis?: string[];       // Emoji whitelist
  signature?: string;             // Custom signature

  // Per-Star Configuration
  starConfigs: {
    1: {
      customInstructions: string; // Custom instructions for 1-star
      autoReply: boolean;         // Auto-post 1-star replies
    },
    2: { /* same structure */ },
    3: { /* same structure */ },
    4: { /* same structure */ },
    5: { /* same structure */ }
  }
}
```

#### `users/{userId}/businesses/{businessId}/reviews/{reviewId}`

```typescript
{
  id: string;                     // Document ID
  googleReviewId: string;         // Google's review ID
  name: string;                   // Reviewer name
  photoUrl?: string;              // Reviewer photo URL
  rating: number;                 // Star rating (1-5)
  text?: string;                  // Review text
  date: Timestamp;                // Review publish date (from Google)
  receivedAt: Timestamp;          // Timestamp when fetched

  // AI Reply Data
  aiReply?: string;               // Generated AI reply
  aiReplyGeneratedAt?: Timestamp; // Generation timestamp
  replyStatus: 'pending' | 'rejected' | 'posted' | 'failed';

  // Posted Reply Data
  postedReply?: string | null;    // Actual posted reply text
  postedAt?: Timestamp | null;    // Posting timestamp
  postedBy?: string | null;       // User ID who posted
}
```

### Firestore Security Rules

Key rules enforced:
- Users can only read/write their own data
- Stripe subcollections managed by extension only
- Validation for enum fields (toneOfVoice, languageMode, replyStatus)
- Star rating validation (1-5)
- User deletion prevention via Firestore

### Firestore Indexes

Composite indexes configured for optimized queries:
- Businesses by `connectedAt` and `__name__`
- Reviews by multiple field combinations

---

## Firebase Configuration

### Active Project

- **Project ID**: `review-ai-reply`
- **Project Name**: Revyou
- **Project Number**: 595883094755
- **Region**: us-central1 (Cloud Functions)
- **Lifecycle State**: ACTIVE
- **Authenticated User**: alon710@gmail.com

### Deployed Cloud Functions (8 total)

#### Custom Functions

1. **onReviewCreate** (v2)
   - **Trigger**: Firestore document created
   - **Path**: `users/{userId}/businesses/{businessId}/reviews/{reviewId}`
   - **Runtime**: Node.js 22
   - **Memory**: 256MB
   - **Purpose**:
     - Generate AI reply using Gemini
     - Auto-post if enabled for star rating
     - Send email notification
     - Handle errors

#### Extension Functions (Stripe Payments)

2. **ext-firestore-stripe-payments-createCheckoutSession** (v1)
   - Creates Stripe checkout sessions

3. **ext-firestore-stripe-payments-createCustomer** (v1)
   - Creates Stripe customer on user signup

4. **ext-firestore-stripe-payments-createPortalLink** (v1)
   - Generates customer portal links

5. **ext-firestore-stripe-payments-handleWebhookEvents** (v1)
   - Processes Stripe webhook events

6. **ext-firestore-stripe-payments-onCustomerDataDeleted** (v1)
   - Cleanup on customer deletion

7. **ext-firestore-stripe-payments-onUserDeleted** (v1)
   - Cleanup on user deletion

#### Extension Functions (Send Email)

8. **ext-firestore-send-email-processqueue** (v2)
   - Processes email queue from Firestore
   - Sends emails via Resend

### Registered Firebase Apps

- **Platform**: Web
- **App ID**: `1:595883094755:web:da0eba401707f6a2f78bd6`
- **Display Name**: google-review-ai-reply-webapp
- **State**: ACTIVE

---

## API Routes & Endpoints

### Authentication

**`/api/auth/session`**
- **Methods**: GET
- **Purpose**: Retrieve current user session
- **Returns**: User data or null

### Google OAuth

**`/api/google/auth`**
- **Methods**: GET
- **Purpose**: Initiate Google OAuth flow
- **Returns**: Redirect to Google consent screen

**`/api/google/callback`**
- **Methods**: GET
- **Purpose**: Handle OAuth callback
- **Params**: `code` (authorization code)
- **Returns**: Redirect to dashboard with session

**`/api/google/businesses`**
- **Methods**: GET
- **Purpose**: Fetch user's Google Business Profile accounts
- **Auth**: Required
- **Returns**: Array of businesses

### Reviews

**`/api/reviews/[id]/generate`**
- **Methods**: POST
- **Purpose**: Generate AI reply for a specific review
- **Params**: `id` (review ID)
- **Auth**: Required
- **Returns**: Generated AI reply text

---

## TypeScript Types Reference

### Core Database Types

Located in [`types/database.ts`](types/database.ts):

```typescript
// User type
type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  stripeId?: string;
  stripeLink?: string;
  googleRefreshToken?: string;
  selectedBusinessId?: string;
}

// Business type
type Business = {
  id: string;
  googleAccountId: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  description?: string;
  photoUrl?: string;
  connected: boolean;
  connectedAt: Timestamp;
  config: BusinessConfig;
  emailOnNewReview: boolean;
}

// Review type
type Review = {
  id: string;
  googleReviewId: string;
  name: string;
  photoUrl?: string;
  rating: number; // 1-5
  text?: string;
  date: Timestamp;
  receivedAt: Timestamp;
  aiReply?: string;
  aiReplyGeneratedAt?: Timestamp;
  replyStatus: 'pending' | 'rejected' | 'posted' | 'failed';
  postedReply?: string | null;
  postedAt?: Timestamp | null;
  postedBy?: string | null;
}

// Enums
type ToneOfVoice = 'friendly' | 'formal' | 'humorous' | 'professional';
type LanguageMode = 'hebrew' | 'english' | 'auto-detect';
type ReplyStatus = 'pending' | 'rejected' | 'posted' | 'failed';
```

### Subscription & Feature Types

Located in [`lib/stripe/entitlements.ts`](lib/stripe/entitlements.ts):

```typescript
type PlanType = 'free' | 'basic' | 'pro';
type BillingPeriod = 'monthly' | 'yearly';

interface PlanLimits {
  businesses: number;           // Max businesses allowed
  reviewsPerMonth: number;      // Monthly review limit
  autoPost: boolean;            // Auto-posting enabled
  requireApproval: boolean;     // Manual approval required
}
```

### Feature Configuration Keys

Located in [`lib/stripe/feature-config.ts`](lib/stripe/feature-config.ts):

```typescript
const FEATURE_KEYS = {
  MAX_BUSINESSES: 'max_businesses',
  MONTHLY_REVIEWS: 'monthly_reviews',
  MANUAL_APPROVAL: 'manual_approval',
  AUTO_PUBLISH: 'auto_publish',
  WHATSAPP_SUPPORT: 'whatsapp_support',
}
```

---

## Development Guidelines

### Environment Setup

Create a `.env.local` file with the following variables:

```bash
# Firebase (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=review-ai-reply
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Server-side)
FIREBASE_ADMIN_PROJECT_ID=review-ai-reply
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# AI & Services
GEMINI_API_KEY=
TOKEN_ENCRYPTION_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY=
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Mock Google API for local testing
USE_MOCK_GOOGLE_API=false
MOCK_API_URL=http://localhost:3001
```

### Available Scripts

```bash
# Development
yarn dev              # Start dev server with Turbopack

# Building
yarn build            # Lint check + build for production
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint
yarn lint:check       # Check linting errors
yarn lint:fix         # Auto-fix linting errors
yarn format:check     # Check Prettier formatting
yarn format:write     # Auto-format with Prettier
yarn knip             # Detect unused code

# Database
yarn seed             # Seed database with sample data
yarn seed:review      # Seed a single review
```

### Code Quality Tools

- **ESLint 9**: Configured with Next.js rules + unused imports plugin
- **Prettier 3.6.2**: Enforced formatting before build
- **Knip 5.66.3**: Detects unused dependencies, exports, and types
- **TypeScript Strict Mode**: Full type safety

### Project-Specific Conventions

1. **File Organization**: Components organized by feature/section
2. **Naming**:
   - Components: PascalCase (`BusinessCard.tsx`)
   - Utilities: camelCase (`formatDate.ts`)
   - Constants: UPPER_SNAKE_CASE (`FEATURE_KEYS`)
3. **Imports**: Use `@/` alias for absolute imports from root
4. **State Management**:
   - Use Context for auth/business state
   - Use Zustand for UI state
   - Use React Query patterns for server state
5. **Styling**: Tailwind CSS utility classes with shadcn/ui components

---

## Key Libraries & Services

### AI Integration ([`lib/ai/`](lib/ai/))

**Gemini Client** (`gemini.ts`):
- Google Generative AI SDK
- Model: `gemini-1.5-flash`
- Prompt building from business config
- Retry logic and error handling

**Prompt Templates** (`prompts/template.ts`):
- Default business prompt structure
- Dynamic variable injection (business name, tone, etc.)
- Support for Hebrew and English

### Firebase Services ([`lib/firebase/`](lib/firebase/))

**Authentication** (`auth.ts`):
- Google OAuth token encryption/decryption
- Session management
- User CRUD operations

**Business Management** (`business.ts`):
- Firestore queries for businesses
- Business connection/disconnection
- Config updates

**Review Operations** (`reviews.ts`):
- Review fetching and filtering
- Status updates
- AI reply management

### Google APIs ([`lib/google/`](lib/google/))

**OAuth Flow** (`auth.ts`):
- Authorization URL generation
- Token exchange
- Refresh token handling

**Business Profile API** (`business-profile.ts`):
- Fetch business accounts
- Sync business data
- Post review replies

### Stripe Integration ([`lib/stripe/`](lib/stripe/))

**Client** (`client.ts`):
- Stripe SDK initialization
- Payment method management

**Entitlements** (`entitlements.ts`):
- Feature flag parsing
- Plan limit enforcement
- Usage tracking

**Feature Configuration** (`feature-config.ts`):
- Metadata extraction from Stripe products
- Type conversion (number, boolean, text)
- Feature display formatting

---

## Deployment Information

### Hosting

- **Platform**: Vercel (via Next.js)
- **Domain**: TBD
- **Environment**: Production

### Firebase Services

- **Region**: us-central1
- **Firestore**: Native mode
- **Auth**: Email/password + Google OAuth
- **Functions**: Node.js 22 runtime
- **Storage**: Not currently used

### CI/CD

- **Build Check**: `yarn format:check && next build`
- **Deployment**: Automatic via Vercel GitHub integration
- **Functions**: Manual deployment via `firebase deploy --only functions`

### Environment Variables (Production)

All environment variables must be set in Vercel dashboard:
- Firebase configuration
- Google OAuth credentials
- Gemini API key
- Stripe keys
- Resend API key

---

## Common Workflows

### Adding a New Feature Flag

1. Add key to `FEATURE_KEYS` in [`lib/stripe/feature-config.ts`](lib/stripe/feature-config.ts)
2. Add config to `FEATURE_CONFIGS` array
3. Update Stripe product metadata in Stripe dashboard
4. Update `PlanLimits` type in [`lib/stripe/entitlements.ts`](lib/stripe/entitlements.ts)
5. Implement feature gating in UI/API

### Modifying AI Reply Generation

1. Update prompt template in [`lib/ai/prompts/template.ts`](lib/ai/prompts/template.ts)
2. Modify business config if needed in [`types/database.ts`](types/database.ts)
3. Update UI in [`components/dashboard/businesses/`](components/dashboard/businesses/)
4. Test with [`yarn seed:review`](scripts/seed-review.ts)
5. Deploy updated Cloud Function

### Adding a New Subscription Tier

1. Create product in Stripe dashboard
2. Add monthly + yearly prices
3. Set feature metadata on Stripe product
4. Update environment variables with price IDs
5. Add tier to UI in [`components/landing/`](components/landing/) pricing section
6. Test checkout flow

### Debugging Cloud Functions

```bash
# View recent logs
firebase functions:log

# View specific function logs
firebase functions:log --only onReviewCreate

# Local emulator testing
firebase emulators:start
```

---

## Important Notes & Gotchas

### Stripe Price IDs

⚠️ **Critical**: The `.env.local` file must contain real Stripe price IDs. Placeholder values will cause checkout to fail.

### Google Business Profile API Approval

⚠️ The app requires Google Business Profile API approval for production use. Use `USE_MOCK_GOOGLE_API=true` for local development without API access.

### Token Encryption

🔐 OAuth refresh tokens are encrypted using `@hapi/iron` before storage in Firestore. The `TOKEN_ENCRYPTION_SECRET` must be at least 32 characters.

### Firestore Security Rules

🛡️ Security rules prevent users from deleting their own user document via Firestore. User deletion must be handled through Firebase Auth.

### Hebrew Language Support

🇮🇱 The app has bilingual support (Hebrew/English). Many strings, especially in pricing and features, are in Hebrew. The AI can auto-detect language or use specified mode.

### Review Sync

🔄 Reviews are currently synced manually via the dashboard. Automatic polling is not yet implemented. Consider adding a scheduled Cloud Function for periodic sync.

### Email Notifications

📧 Email sending uses the Firebase extension which processes a Firestore queue. Email delivery is asynchronous and may have delays.

---

## Helpful Resources

### Documentation

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe Firestore Extension](https://github.com/invertase/stripe-firebase-extensions)
- [Google Generative AI SDK](https://ai.google.dev/api)
- [Shadcn/ui Components](https://ui.shadcn.com/)

### External APIs

- [Google Business Profile API](https://developers.google.com/my-business/reference/rest)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Resend API Docs](https://resend.com/docs)

### Tools

- [Firebase Console](https://console.firebase.google.com/project/review-ai-reply)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Future Enhancements

### Planned Features

- [ ] Automatic review polling (scheduled Cloud Function)
- [ ] WhatsApp support integration
- [ ] Multi-language UI localization
- [ ] Advanced analytics and reporting
- [ ] Review sentiment analysis
- [ ] Bulk reply operations
- [ ] Review templates library
- [ ] Mobile app (React Native)

### Performance Optimizations

- [ ] Implement Redis caching for frequently accessed data
- [ ] Optimize Firestore query patterns
- [ ] Add pagination for large review lists
- [ ] Implement incremental static regeneration (ISR)
- [ ] Add service worker for offline support

### Developer Experience

- [ ] Add Storybook for component documentation
- [ ] Implement E2E testing with Playwright
- [ ] Add unit tests for critical business logic
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add API documentation with OpenAPI/Swagger

---

## Project Status

**Current Phase**: Production Ready (v0.1.0)

**Active Development Areas**:
- Dashboard analytics and visualizations
- Business configuration UI improvements
- Review management workflow enhancements

**Recent Updates**:
- Streamlined dashboard chart configurations (commit: 044a385)
- Implemented dashboard statistics and visualizations (commit: 974da5e)
- Improved form data reset logic (commit: 6722d89)

---

## Contact & Support

- **Developer**: alon710@gmail.com
- **Firebase Project Owner**: alon710@gmail.com
- **GitHub**: (Repository URL not specified)

---

**Last Updated**: 2025-11-04
**Generated By**: Claude (Anthropic) - claude-sonnet-4-5-20250929
