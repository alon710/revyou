# Google Review AI Reply - Development Plan

## Project Overview
A Hebrew RTL web application that helps business owners automatically generate AI-powered replies to customer reviews using Firebase, Google Business Profile API, and Gemini AI.

## Technology Stack
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **UI Components**: ShadCN UI with RTL support
- **Backend & Database**: Firebase (Auth, Firestore, Cloud Functions, Hosting)
- **AI**: Firebase AI Logic with Gemini API
- **Payments**: Stripe
- **Notifications**: Google Cloud Pub/Sub
- **External APIs**: Google Business Profile API

---

## Development Phases

### Phase 1: Project Setup & Configuration

#### 1.1 Install Core Dependencies
```bash
# UI & RTL Support
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge lucide-react
npm install -D tailwindcss-rtl

# Firebase
npm install firebase firebase-admin firebase-functions
npm install -D firebase-tools

# Stripe
npm install @stripe/stripe-js stripe

# Google APIs
npm install googleapis google-auth-library

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Date handling with Hebrew support
npm install date-fns date-fns-tz
```

#### 1.2 Configure Tailwind for RTL
- Update `tailwind.config.ts` to support RTL directionality
- Add `tailwindcss-rtl` plugin
- Configure Hebrew font (use "Rubik" or "Assistant" from Google Fonts)

#### 1.3 Initialize ShadCN UI
```bash
npx shadcn@latest init
```
- Configure for RTL layout
- Install initial components: button, card, input, label, dropdown, dialog, toast

#### 1.4 Firebase Project Setup
- Create new Firebase project in Firebase Console
- Enable Firebase Authentication (Google provider)
- Create Firestore database
- Initialize Firebase CLI: `firebase init`
- Configure Firebase services:
  - Authentication
  - Firestore
  - Functions
  - Hosting
- Add Firebase config to `/lib/firebase/config.ts` (client-side)
- Add Firebase Admin SDK config to `/lib/firebase/admin.ts` (server-side)

#### 1.5 Google Cloud Project Setup
- Enable Google Business Profile API
- Create OAuth 2.0 credentials
- Set up Cloud Pub/Sub topic for review notifications
- Grant permissions to `mybusiness-api-pubsub@system.gserviceaccount.com`
- Configure OAuth consent screen

#### 1.6 Project Structure
Create the following directory structure:
```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /dashboard
    /businesses
    /reviews
    /settings
  /api
    /stripe
    /webhooks
/components
  /ui           # ShadCN components
  /layout       # Layout components (Header, Sidebar, etc.)
  /dashboard    # Dashboard-specific components
  /landing      # Landing page components
/lib
  /firebase
  /stripe
  /google
  /ai
  /utils
/types
/hooks
/functions    # Firebase Cloud Functions
  /src
    /triggers
    /api
    /scheduled
```

---

### Phase 2: Landing Page

#### 2.1 Root Layout Setup
- Update `app/layout.tsx` with:
  - Hebrew language (`lang="he"`)
  - RTL direction (`dir="rtl"`)
  - Rubik/Assistant Google Font
  - Global styles for RTL

#### 2.2 Landing Page Components
Create in `/components/landing`:
- `Hero.tsx` - Main hero section with value proposition
- `Features.tsx` - Key features showcase (auto-replies, customization, analytics)
- `Pricing.tsx` - Pricing tiers display
- `HowItWorks.tsx` - Step-by-step explanation
- `FAQ.tsx` - Common questions
- `Footer.tsx` - Footer with links

#### 2.3 Landing Page Content (Hebrew)
- Write compelling copy in Hebrew
- Highlight key benefits:
  - Save time on review responses
  - Maintain consistent brand voice
  - Customize by star rating
  - Multi-language support

#### 2.4 Navigation & CTAs
- Create `Header.tsx` with login/register buttons
- Add sticky header
- Implement smooth scroll to sections
- Add "Start Free Trial" CTA buttons

---

### Phase 3: Firebase Authentication

#### 3.1 Firebase Auth Setup
- Create `/lib/firebase/auth.ts` with:
  - `signInWithGoogle()` function
  - `signOut()` function
  - `useAuth()` hook
  - Auth state listener

#### 3.2 Auth Pages
- `/app/(auth)/login/page.tsx` - Login page with Google button
- Create redirect logic after successful login
- Handle auth errors with Hebrew messages

#### 3.3 Auth Context Provider
- Create `/contexts/AuthContext.tsx`
- Wrap app with AuthProvider
- Provide user state globally

#### 3.4 Protected Routes
- Create `/middleware.ts` for route protection
- Redirect unauthenticated users to login
- Redirect authenticated users from login to dashboard

---

### Phase 4: Firestore Database Schema

#### 4.1 Collections Structure

**users** collection:
```typescript
{
  uid: string (document ID)
  email: string
  displayName: string
  photoURL: string
  createdAt: timestamp
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise'
  stripeCustomerId: string
  googleRefreshToken: string (encrypted)
}
```

**businesses** collection:
```typescript
{
  id: string (auto-generated)
  userId: string (owner)
  googleAccountId: string
  googleLocationId: string
  name: string
  address: string
  photoUrl: string
  connected: boolean
  connectedAt: timestamp

  // Configuration
  config: {
    businessDescription: string
    toneOfVoice: 'friendly' | 'formal' | 'humorous' | 'professional'
    useEmojis: boolean
    languageMode: 'hebrew' | 'english' | 'auto-detect' | 'match-reviewer'
    autoPost: boolean
    requireApproval: boolean

    // Star-specific configs
    starConfigs: {
      1: { customInstructions: string, enabled: boolean }
      2: { customInstructions: string, enabled: boolean }
      3: { customInstructions: string, enabled: boolean }
      4: { customInstructions: string, enabled: boolean }
      5: { customInstructions: string, enabled: boolean }
    }
  }
}
```

**reviews** collection:
```typescript
{
  id: string (auto-generated)
  businessId: string
  googleReviewId: string
  reviewerName: string
  reviewerPhotoUrl: string
  rating: number (1-5)
  reviewText: string
  reviewDate: timestamp
  receivedAt: timestamp

  // AI Reply
  aiReply: string
  aiReplyGeneratedAt: timestamp
  replyStatus: 'pending' | 'approved' | 'rejected' | 'posted' | 'failed'

  // Posted reply
  postedReply: string | null
  postedAt: timestamp | null
  postedBy: string | null

  // If user edited the AI reply
  wasEdited: boolean
  editedReply: string | null
}
```

**subscriptions** collection:
```typescript
{
  id: string (auto-generated)
  userId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: timestamp
  cancelAtPeriodEnd: boolean
}
```

#### 4.2 Security Rules
Create `firestore.rules`:
- Users can only read/write their own data
- Business ownership validation
- Review access based on business ownership

#### 4.3 Firestore Indexes
Create `firestore.indexes.json`:
- Index for reviews by businessId and receivedAt
- Index for businesses by userId
- Composite indexes as needed

---

### Phase 5: Dashboard Layout & UI

#### 5.1 Dashboard Layout
Create `/app/(dashboard)/layout.tsx`:
- Sidebar navigation (RTL positioned)
- Top header with user menu
- Main content area
- Responsive mobile menu

#### 5.2 Sidebar Navigation
Create `/components/layout/Sidebar.tsx`:
- Dashboard overview link
- Businesses management link
- Reviews link
- Settings link
- Billing link
- User profile section at bottom

#### 5.3 Dashboard Home
Create `/app/(dashboard)/dashboard/page.tsx`:
- Overview statistics cards:
  - Total reviews this month
  - AI replies generated
  - Response rate
  - Average rating
- Recent reviews list
- Quick actions

---

### Phase 6: Business Management

#### 6.1 Google OAuth Flow
Create `/lib/google/oauth.ts`:
- Implement OAuth 2.0 flow for Google Business Profile API
- Request scopes:
  - `https://www.googleapis.com/auth/business.manage`
- Store refresh token securely in Firestore (encrypted)
- Handle token refresh

#### 6.2 Connect Google Account
Create `/app/(dashboard)/businesses/connect/page.tsx`:
- "Connect Google Account" button
- Initiate OAuth flow
- Handle callback with authorization code
- Exchange code for tokens

#### 6.3 Select Business Location
Create `/components/dashboard/BusinessSelector.tsx`:
- Fetch user's Google Business locations using API
- Display in dropdown/list with:
  - Business name
  - Address
  - Photo
- Allow user to select location
- Save to Firestore

#### 6.4 Business List Page
Create `/app/(dashboard)/businesses/page.tsx`:
- Display all connected businesses
- Show connection status
- Add new business button
- Remove business option (with confirmation)
- Edit business config button

#### 6.5 Business Configuration Form
Create `/components/dashboard/BusinessConfigForm.tsx`:
- Business description textarea
- Tone of voice dropdown
- Emoji toggle
- Language mode selector
- Auto-post toggle
- Require approval toggle
- Star rating specific configs (accordion/tabs):
  - Enable/disable auto-reply per star
  - Custom instructions per star rating
- Save configuration to Firestore

---

### Phase 7: Google Business Profile API Integration

#### 7.1 API Client Setup
Create `/lib/google/business-profile.ts`:
- Initialize Google APIs client
- Authenticate with OAuth tokens
- Implement token refresh logic

#### 7.2 Fetch Locations
- Function to fetch user's Google Business locations
- Return location details (name, address, ID, photo)

#### 7.3 Fetch Reviews
- Function to fetch reviews for a location
- Support pagination
- Parse review data

#### 7.4 Post Reply
- Function to post reply to a review
- Handle API errors
- Return success/failure status

---

### Phase 8: Cloud Pub/Sub Integration

#### 8.1 Pub/Sub Topic Setup
In Google Cloud Console:
- Create Pub/Sub topic: `google-business-reviews`
- Grant permissions to `mybusiness-api-pubsub@system.gserviceaccount.com`
- Create push subscription to Firebase Cloud Function

#### 8.2 Link Business Account to Pub/Sub
Create Cloud Function `/functions/src/api/linkBusinessToPubSub.ts`:
- Called when user connects new business
- Use `accounts.updateNotificationSetting` endpoint
- Link business account to Pub/Sub topic
- Subscribe to `NEW_REVIEW` notifications

#### 8.3 Pub/Sub Webhook Receiver
Create Cloud Function `/functions/src/triggers/onReviewNotification.ts`:
- HTTP function to receive Pub/Sub push messages
- Verify Pub/Sub message authenticity
- Parse notification payload
- Extract review details:
  - Location ID
  - Review ID
- Trigger review processing workflow

#### 8.4 Review Fetching
Create function to fetch full review details:
- Use review ID from notification
- Fetch from Google Business Profile API
- Extract: reviewer name, rating, text, date
- Store in Firestore `reviews` collection

---

### Phase 9: AI Reply Generation with Gemini

#### 9.1 Firebase AI Logic Setup
- Enable Firebase AI Logic in Firebase Console
- Get Gemini API key
- Configure Firebase App Check for security

#### 9.2 Gemini Client
Create `/lib/ai/gemini.ts`:
- Initialize Gemini API client
- Function to generate reply with prompt

#### 9.3 Reply Generation Function
Create Cloud Function `/functions/src/triggers/generateReply.ts`:
- Triggered when new review is stored in Firestore
- Fetch business configuration from Firestore
- Build prompt based on:
  - Business description
  - Tone of voice
  - Star rating
  - Custom instructions for that star rating
  - Emoji usage preference
  - Language preference
- Call Gemini API to generate reply
- Store generated reply in `reviews` document
- Update `replyStatus` to 'pending' or 'approved' based on config

#### 9.4 Prompt Engineering
Create `/lib/ai/prompts.ts`:
- Template function that builds Gemini prompt
- Include context:
  - Business type and description
  - Review rating and text
  - Desired tone
  - Language requirements
  - Emoji preferences
- Example prompt structure:
  ```
  You are helping a business owner respond to a customer review.

  Business: {businessDescription}
  Review Rating: {rating}/5
  Review Text: "{reviewText}"

  Generate a reply with the following characteristics:
  - Tone: {toneOfVoice}
  - Language: {language}
  - Use emojis: {useEmojis}
  - Additional instructions: {customInstructions}

  The reply should be professional, empathetic, and address the customer's feedback.
  ```

---

### Phase 10: Review Management Dashboard

#### 10.1 Reviews List Page
Create `/app/(dashboard)/reviews/page.tsx`:
- Fetch reviews for user's businesses from Firestore
- Display in table/list with:
  - Business name
  - Reviewer name and photo
  - Rating (stars)
  - Review text
  - AI generated reply
  - Status (pending/approved/rejected/posted)
  - Actions (approve, reject, edit, post)
- Filter options:
  - By business
  - By status
  - By rating
  - By date range
- Pagination

#### 10.2 Review Card Component
Create `/components/dashboard/ReviewCard.tsx`:
- Display review details
- Show AI generated reply
- Action buttons based on status:
  - If pending & requireApproval: Approve/Reject buttons
  - If approved: Post button
  - Edit reply button
  - View posted reply (if posted)

#### 10.3 Review Actions
Create `/lib/reviews/actions.ts`:
- `approveReply()` - Update status to approved
- `rejectReply()` - Update status to rejected
- `editReply()` - Allow user to edit AI reply
- `postReply()` - Post reply to Google

#### 10.4 Auto-posting Logic
In Cloud Function `/functions/src/triggers/generateReply.ts`:
- After AI reply generation
- Check if `autoPost` is enabled AND `requireApproval` is false
- If yes, automatically post reply to Google
- Update status to 'posted'
- If `requireApproval` is true, set status to 'pending'

---

### Phase 11: Stripe Integration

#### 11.1 Pricing Tiers
Define subscription tiers:
- **Free**: 1 business, 10 reviews/month, approval required
- **Basic**: 3 businesses, 100 reviews/month, $29/month
- **Pro**: 10 businesses, 500 reviews/month, auto-post enabled, $79/month
- **Enterprise**: Unlimited, custom pricing

#### 11.2 Stripe Setup
- Create Stripe account
- Add products and pricing in Stripe Dashboard
- Get Stripe API keys (publishable & secret)
- Store in environment variables

#### 11.3 Stripe Client
Create `/lib/stripe/client.ts`:
- Initialize Stripe on client-side
- Create checkout session

#### 11.4 Stripe Server
Create `/lib/stripe/server.ts`:
- Initialize Stripe on server-side
- Create customer
- Create subscription
- Cancel subscription
- Get subscription details

#### 11.5 Checkout Flow
Create `/app/(dashboard)/billing/page.tsx`:
- Display current subscription tier
- Show usage limits and current usage
- Upgrade/downgrade buttons
- Initiate Stripe checkout session
- Redirect to Stripe checkout

#### 11.6 Stripe Webhooks
Create API route `/app/api/stripe/webhook/route.ts`:
- Verify Stripe webhook signature
- Handle events:
  - `checkout.session.completed` - Create subscription in Firestore
  - `customer.subscription.updated` - Update subscription status
  - `customer.subscription.deleted` - Handle cancellation
  - `invoice.payment_failed` - Handle failed payment

#### 11.7 Usage Limits
Create `/lib/billing/limits.ts`:
- Function to check if user has reached limits
- Check before:
  - Adding new business
  - Generating AI reply
- Show upgrade prompt if limit reached

---

### Phase 12: Firebase Cloud Functions

#### 12.1 Functions Structure
Organize in `/functions/src`:
```
/triggers
  - onReviewNotification.ts (Pub/Sub)
  - generateReply.ts (Firestore trigger)
  - onUserCreated.ts (Auth trigger)
/api
  - linkBusinessToPubSub.ts
  - fetchGoogleReviews.ts
  - postReplyToGoogle.ts
/scheduled
  - checkNewReviews.ts (backup polling)
  - cleanupOldData.ts
```

#### 12.2 Scheduled Functions
Create scheduled function (runs every 15 minutes as backup):
- Fetch reviews for all connected businesses
- Check for new reviews not yet in Firestore
- Process new reviews (fallback if Pub/Sub misses)

#### 12.3 Error Handling
- Implement try-catch blocks
- Log errors to Firebase
- Send error notifications to admins
- Retry logic for failed API calls

#### 12.4 Deploy Functions
```bash
firebase deploy --only functions
```

---

### Phase 13: Settings & User Profile

#### 13.1 Settings Page
Create `/app/(dashboard)/settings/page.tsx`:
- Tabs for different settings:
  - Profile
  - Notifications
  - API Keys
  - Preferences

#### 13.2 Profile Settings
- Update display name
- Update email
- Change password (if using email/password auth)
- Delete account option

#### 13.3 Notification Preferences
- Email notifications for:
  - New reviews
  - Failed reply posts
  - Weekly summary
- Toggle on/off

---

### Phase 14: Testing & Quality Assurance

#### 14.1 Unit Tests
- Test utility functions
- Test Firestore queries
- Test AI prompt generation

#### 14.2 Integration Tests
- Test Google OAuth flow
- Test review fetching
- Test AI reply generation
- Test Stripe checkout

#### 14.3 Manual Testing Checklist
- [ ] User can sign in with Google
- [ ] User can connect Google Business account
- [ ] User can select business location
- [ ] User can configure business settings
- [ ] New review triggers notification
- [ ] AI reply is generated correctly
- [ ] User can approve/reject replies
- [ ] User can edit replies
- [ ] Reply is posted to Google successfully
- [ ] Stripe checkout works
- [ ] Subscription limits are enforced
- [ ] RTL layout works correctly
- [ ] Hebrew text displays properly
- [ ] Mobile responsive design works

---

### Phase 15: Deployment

#### 15.1 Environment Variables
Create `.env.local` for development:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=

STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

#### 15.2 Firebase Hosting Setup
Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 15.3 Build & Deploy
```bash
# Build Next.js app
npm run build

# Deploy to Firebase
firebase deploy
```

#### 15.4 Custom Domain
- Add custom domain in Firebase Hosting
- Configure DNS records
- Enable SSL

---

### Phase 16: Monitoring & Analytics

#### 16.1 Firebase Analytics
- Enable Firebase Analytics
- Track key events:
  - User sign-up
  - Business connected
  - Review received
  - Reply generated
  - Reply posted
  - Subscription created

#### 16.2 Error Monitoring
- Set up Firebase Crashlytics (for mobile apps)
- Use Firebase Functions logs
- Set up alerts for critical errors

#### 16.3 Performance Monitoring
- Monitor Cloud Function execution times
- Track API response times
- Monitor Firestore read/write operations

---

## Additional Considerations

### Security Best Practices
- Never expose API keys in client-side code
- Use Firebase App Check to prevent abuse
- Implement rate limiting on Cloud Functions
- Encrypt sensitive data in Firestore
- Use Firestore Security Rules properly
- Validate all user inputs

### Scalability
- Use Firestore composite indexes for efficient queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use Cloud Functions for heavy processing
- Monitor and optimize Cloud Function cold starts

### Compliance
- Add Terms of Service
- Add Privacy Policy
- Handle GDPR requirements (data export/deletion)
- Comply with Google Business Profile API terms

### Future Enhancements (Post-MVP)
- Analytics dashboard with charts
- A/B testing for reply variations
- Multi-user support (team accounts)
- Reply templates library
- Sentiment analysis of reviews
- Competitor review monitoring
- Mobile app (React Native/Flutter)
- WhatsApp/Email notifications
- Integration with other review platforms (Yelp, Facebook, etc.)

---

## Development Timeline Estimate

- **Phase 1-2**: 2-3 days (Setup & Landing Page)
- **Phase 3-4**: 2 days (Auth & Database)
- **Phase 5-6**: 3-4 days (Dashboard & Business Management)
- **Phase 7-8**: 3-4 days (Google API & Pub/Sub)
- **Phase 9-10**: 3-4 days (AI & Review Management)
- **Phase 11**: 2-3 days (Stripe)
- **Phase 12-13**: 2 days (Functions & Settings)
- **Phase 14**: 2-3 days (Testing)
- **Phase 15-16**: 1-2 days (Deployment & Monitoring)

**Total**: Approximately 3-4 weeks for MVP

---

## Getting Started

When ready to begin development, start with Phase 1 and work through each phase sequentially. Each phase builds upon the previous one.

Use this document to guide development sessions:
1. Choose a phase
2. Implement the features described
3. Test thoroughly
4. Move to next phase

Good luck building your AI-powered review reply application!
