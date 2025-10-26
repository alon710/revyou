This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

Before running the application, you need to configure your environment variables in `.env.local`:

### Required Stripe Configuration

The application uses [Firestore Stripe Payments Extension](https://github.com/invertase/stripe-firebase-extensions/tree/next/firestore-stripe-payments) for subscription management. You need to set up the following Stripe price IDs:

1. **Create Products in Stripe Dashboard**: Create two subscription products (Basic and Professional)
2. **Create Prices**: For each product, create both monthly and yearly prices
3. **Update `.env.local`** with your actual price IDs:

```bash
# Replace these placeholder values with your actual Stripe price IDs
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
```

**Important**: The current `.env.local` has placeholder price IDs that will cause checkout to fail. You must replace them with real price IDs from your Stripe account.

### Other Required Environment Variables

- Firebase configuration (already set up)
- Google OAuth credentials
- Gemini API key for AI features

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
