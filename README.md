# Bottie

**AI-Powered Google Review Management Platform**

Bottie is a SaaS platform that automates responses to Google Business Profile reviews using AI. Help businesses manage their online reputation by generating personalized, AI-powered replies to customer reviews with smart customization and multi-language support.

## Features

### AI-Powered Review Responses

- **Smart AI Generation** - Powered by Google's Gemini 2.0 Flash model for natural, context-aware replies
- **Customizable Tone** - Choose from friendly, formal, humorous, or professional tones
- **Multi-Language Support** - English and Hebrew with automatic language detection and RTL support
- **Star-Rating Specific** - Custom instructions for each rating level (1-5 stars)
- **Personalization** - Name transliteration, emoji support, and custom signatures
- **Auto-Post or Approve** - Automatically post replies or review before publishing

### Google Business Profile Integration

- **OAuth 2.0 Authentication** - Secure Google account connection
- **Real-Time Notifications** - Instant review alerts via Google Pub/Sub webhooks
- **Auto-Fetch Reviews** - Automatic review synchronization
- **Direct Posting** - Post replies directly to Google Business Profile
- **Multi-Location Support** - Manage multiple business locations from one account

### Subscription Management

Three flexible pricing tiers powered by Paddle:

- **Free Tier** - 1 business, 10 reviews/month, manual approval required
- **Basic Tier** - 3 businesses, 100 reviews/month, auto-post enabled
- **Pro Tier** - Unlimited businesses and reviews

### Multi-Business Management

- Multiple Google Business Profile accounts
- Multiple locations per account
- Per-business AI configuration
- Business-specific star rating settings
- Independent connection management

### Intuitive Onboarding

1. Connect your Google account
2. Choose business locations to manage
3. Configure AI settings (tone, language, emojis)
4. Set up star rating preferences
5. Start receiving and responding to reviews

### Comprehensive Dashboard

- Review monitoring and management
- Review statistics and analytics
- AI reply approval and editing workflow
- Business settings configuration
- Subscription management
- User preferences

## Tech Stack

### Frontend

- **Next.js 15.5.6** - React framework with App Router
- **React 19.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4** - Styling with shadcn/ui components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **Zustand** - State management
- **next-intl** - Internationalization (i18n)
- **Recharts** - Data visualization

### Backend

- **Next.js API Routes** - Serverless functions
- **Supabase** - Authentication and database
- **Drizzle ORM** - Type-safe PostgreSQL ORM
- **PostgreSQL** - Database with Row Level Security

### External Services

- **Google Gemini AI** - AI response generation
- **Google OAuth 2.0** - Account authentication
- **Google Business Profile API** - Business data and reviews
- **Google Pub/Sub** - Real-time review notifications
- **Paddle** - Subscription billing and payments
- **Resend** - Email notifications

## Project Structure

```
Bottie/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── (landing)/         # Landing page
│   │   │   ├── (auth)/            # Authentication pages
│   │   │   ├── (checkout)/        # Checkout flow
│   │   │   ├── dashboard/         # Dashboard pages
│   │   │   └── onboarding/        # Onboarding flow
│   │   ├── api/                   # API routes
│   │   │   ├── google/            # Google OAuth callbacks
│   │   │   ├── internal/          # Internal processing
│   │   │   ├── user/              # User endpoints
│   │   │   └── webhooks/          # External webhooks
│   │   └── auth/                  # Auth callbacks
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── landing/               # Landing page components
│   │   ├── dashboard/             # Dashboard components
│   │   └── onboarding/            # Onboarding components
│   ├── contexts/                  # React contexts
│   ├── hooks/                     # Custom React hooks
│   └── i18n/                      # i18n configuration
├── lib/                           # Shared utilities
│   ├── actions/                   # Server actions
│   ├── ai/                        # AI integration & prompts
│   ├── auth/                      # Authentication helpers
│   ├── controllers/               # Business logic
│   ├── db/                        # Database layer
│   │   ├── schema/                # Drizzle schemas
│   │   └── repositories/          # Data access layer
│   ├── google/                    # Google API integration
│   ├── store/                     # Zustand stores
│   ├── subscriptions/             # Subscription logic
│   └── supabase/                  # Supabase clients
├── messages/                      # i18n translations
│   ├── en.json                    # English
│   └── he.json                    # Hebrew
├── scripts/                       # Build & utility scripts
└── drizzle.config.ts              # Database configuration
```

## Environment Setup

Before running the application, configure your environment variables in `.env.local`:

### Required Configuration

The application requires several service integrations:

1. **Paddle Configuration** (Billing):
   - Create subscription plans in Paddle Dashboard
   - Set up price IDs for Starter and Pro plans (monthly and yearly)
   - Configure webhook secret for payment events

2. **Google Cloud Services**:
   - Google OAuth credentials (for Google Business Profile integration)
   - Google Pub/Sub (for review notifications)
   - Gemini API key (for AI reply generation)

3. **Supabase** (Authentication & Database):
   - PostgreSQL database with Drizzle ORM
   - Authentication with Supabase Auth

4. **Resend** (Email Service):
   - API key for sending email notifications
   - Verified sender domain

5. **Internal Services**:
   - Token encryption secret
   - Internal API secret (for webhook processing)

See [`.env.example`](.env.example) for a complete list of required environment variables.

## Getting Started

### Prerequisites

- Node.js 22.13.1 (see `.nvmrc` so `nvm use` sets the runtime; installs work without `--ignore-engines`)
- npm, yarn, pnpm, or bun
- PostgreSQL database (via Supabase)
- Google Cloud project with required APIs enabled
- Paddle account for billing

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Bottie
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run database migrations:

```bash
npm run db:push
# or
yarn db:push
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The project uses Drizzle ORM with PostgreSQL via Supabase:

```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate migrations
- `npm run db:studio` - Open Drizzle Studio

### Code Quality

The project uses:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Knip** - Unused code detection

## Key Workflows

### Review Processing Flow

1. Google sends webhook to `/api/webhooks/google-reviews`
2. Application fetches full review data from Google API
3. Review is stored in database
4. Internal processing endpoint is triggered
5. User subscription quota is checked
6. AI reply is generated using Gemini
7. Reply is auto-posted (if enabled) or saved for approval
8. Email notification is sent to user

### Authentication Flow

- Supabase Auth for user authentication
- Google OAuth for business profile access
- Encrypted token storage using @hapi/iron
- Middleware protection for authenticated routes
- Row Level Security (RLS) for data isolation

## Internationalization

The application supports multiple languages:

- **English (en)** - Default language
- **Hebrew (he)** - Full RTL support

Language detection is based on route locale (`/en/*` or `/he/*`).

Translation files are located in the [`messages/`](messages/) directory.

## Security

- **Row Level Security (RLS)** on all database tables
- **Encrypted OAuth tokens** using @hapi/iron
- **Supabase Auth** for user authentication
- **Environment-based secrets** for API keys
- **Webhook signature verification** for external webhooks
- **Policy-based access control** for multi-tenant data

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Environment Variables

Ensure all required environment variables are configured in your deployment platform:

- Database connection strings
- API keys and secrets
- OAuth credentials
- Webhook URLs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Add your license here]

## Support

For support, email [your-email] or open an issue in the repository.

---

Built with Next.js and powered by Google Gemini AI
