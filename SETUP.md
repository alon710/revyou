# Setup Guide - Google Review AI Reply

This guide will help you set up the development environment for the Google Review AI Reply application.

## Prerequisites

- Node.js 18+ installed
- A Google account
- A Stripe account (for payment processing)

## Phase 1 Setup - COMPLETED ✅

The following have been set up:
- ✅ All core dependencies installed
- ✅ Tailwind CSS configured for RTL with Hebrew fonts
- ✅ ShadCN UI components initialized
- ✅ Complete project directory structure created
- ✅ Firebase configuration files created

## Next Steps: Configure Your Services

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enable the following services:
   - **Authentication**: Enable Google sign-in provider
   - **Firestore Database**: Create database in production mode
   - **Cloud Functions**: Will be enabled automatically
   - **Hosting**: Will be enabled when you deploy

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the configuration values

5. Get Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values for `.env.local`

### 2. Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create new one)
3. Enable the following APIs:
   - **Google Business Profile API**
   - **Cloud Pub/Sub API**

4. Create OAuth 2.0 Credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Copy Client ID and Client Secret

5. Configure OAuth Consent Screen:
   - Go to APIs & Services > OAuth consent screen
   - Fill in application name and support email
   - Add scopes:
     - `https://www.googleapis.com/auth/business.manage`

6. Set up Cloud Pub/Sub:
   - Go to Pub/Sub > Topics
   - Create a new topic: `google-business-reviews`
   - Grant permissions to: `mybusiness-api-pubsub@system.gserviceaccount.com`
   - Role: `Pub/Sub Publisher`

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys:
   - Go to Developers > API keys
   - Copy "Publishable key" and "Secret key"
   - Use test keys for development (starts with `pk_test_` and `sk_test_`)

3. Create Products and Prices:
   - Go to Products > Add product
   - Create pricing tiers as defined in the development plan:
     - **Free**: Manual setup
     - **Basic**: $29/month
     - **Pro**: $79/month
     - **Enterprise**: Custom pricing

4. Set up Webhooks (later):
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

### 4. Gemini AI API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### 5. Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all the values you collected from the steps above

3. For Firebase Admin Private Key:
   - Open the downloaded JSON file from Firebase Admin SDK
   - Copy the entire `private_key` value (including `\n` characters)
   - Paste it in `.env.local` within quotes

### 6. Install Firebase Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 7. Deploy Firestore Rules and Indexes

```bash
# Login to Firebase
npx firebase login

# Initialize Firebase (if not done)
npx firebase init

# Deploy Firestore rules and indexes
npx firebase deploy --only firestore:rules,firestore:indexes
```

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)           # Authentication pages
  /(dashboard)      # Dashboard pages
  /api              # API routes
/components
  /ui               # ShadCN UI components
  /layout           # Layout components
  /dashboard        # Dashboard-specific components
  /landing          # Landing page components
/lib
  /firebase         # Firebase configuration
  /stripe           # Stripe integration
  /google           # Google APIs integration
  /ai               # Gemini AI integration
  /utils            # Utility functions
/functions          # Firebase Cloud Functions
/types              # TypeScript type definitions
/hooks              # Custom React hooks
/contexts           # React Context providers
```

## Technologies Used

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **AI**: Google Gemini API
- **Payments**: Stripe
- **External APIs**: Google Business Profile API

## RTL & Hebrew Support

The application is configured for RTL (Right-to-Left) layout with Hebrew language support:
- Hebrew fonts: Rubik and Assistant from Google Fonts
- RTL-aware Tailwind CSS utilities
- `lang="he"` and `dir="rtl"` in root HTML

## Next Phase

Once setup is complete, proceed to **Phase 2: Landing Page** in the [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md).

## Troubleshooting

### Firebase initialization fails
- Make sure you're logged in: `npx firebase login`
- Verify your project ID matches in `.env.local` and `firebase.json`

### Tailwind CSS not working
- Restart the dev server: `npm run dev`
- Check `tailwind.config.ts` is properly configured

### TypeScript errors
- Run: `npm install`
- Restart your IDE

## Support

For issues or questions, refer to the [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) or create an issue in the repository.
