# Stripe Entitlements Setup Guide

This guide explains how to configure Stripe products and entitlements to work with the dynamic pricing component.

## Overview

The pricing page now fetches products, prices, and features dynamically from your Firebase `products` collection, which is automatically synced by the Stripe Firebase Extension. Features are defined using Stripe's entitlements system through product metadata.

## Product Setup in Stripe

### 1. Create Products in Stripe Dashboard

Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products) and create three products:

1. **חינם (Free)**
2. **בסיסי (Basic)**
3. **פרו (Professional)**

### 2. Add Product Metadata

For each product, add the following metadata fields:

#### Required Metadata Fields:

- `plan_id` - One of: `free`, `basic`, or `professional`
- `recommended` - Set to `true` for the recommended plan (typically Basic)
- `cta` - Call-to-action button text (e.g., "התחל בחינם", "התחל עכשיו")

#### Feature Metadata Fields:

Each product should include these feature keys with their values:

- `max_businesses` (number) - Maximum number of businesses allowed
  - Example: `1`, `3`, `10`

- `monthly_reviews` (number) - Monthly review quota
  - Example: `5`, `250`, `1000`

- `manual_approval` (text) - Manual approval requirement
  - Example: `חובה`, `אופציונלי`

- `auto_publish` (boolean) - Auto-publish capability
  - Values: `true` or `false`

- `whatsapp_support` (boolean) - WhatsApp support access
  - Values: `true` or `false`

### Example Product Configuration

#### Free Plan
```
Name: חינם
Description: מושלם להתחלה ולעסקים קטנים

Metadata:
  plan_id: free
  recommended: false
  cta: התחל בחינם
  max_businesses: 1
  monthly_reviews: 5
  manual_approval: חובה
  auto_publish: false
  whatsapp_support: false
```

#### Basic Plan
```
Name: בסיסי
Description: לעסקים קטנים ובינוניים

Metadata:
  plan_id: basic
  recommended: true
  cta: התחל עכשיו
  max_businesses: 3
  monthly_reviews: 250
  manual_approval: אופציונלי
  auto_publish: true
  whatsapp_support: false
```

#### Professional Plan
```
Name: פרו
Description: לעסקים גדולים עם צרכים מתקדמים

Metadata:
  plan_id: professional
  recommended: false
  cta: התחל עכשיו
  max_businesses: 10
  monthly_reviews: 1000
  manual_approval: אופציונלי
  auto_publish: true
  whatsapp_support: true
```

## Price Setup

### Create Prices for Each Product

For paid plans (Basic and Professional), create two prices:

1. **Monthly Recurring**
   - Billing period: Monthly
   - Price: (e.g., ₪99 for Basic)
   - Set as active

2. **Yearly Recurring**
   - Billing period: Yearly
   - Price: Calculate with 20% discount (e.g., ₪950.4 for Basic = ₪99 × 12 × 0.8)
   - Set as active

### Example Pricing

**Basic Plan:**
- Monthly: ₪99/month
- Yearly: ₪79.20/month (₪950.4/year)

**Professional Plan:**
- Monthly: ₪349/month
- Yearly: ₪279.20/month (₪3,350.4/year)

## Firebase Extension Configuration

The Stripe Firebase Extension should already be configured with:

```
PRODUCTS_COLLECTION=products
CUSTOMERS_COLLECTION=users
```

This ensures that:
- Products sync to `products` collection
- Prices sync to `products/{productId}/prices` subcollection
- Customer subscriptions sync to `users/{userId}/subscriptions`

## How It Works

1. **Product Fetching**: The Pricing component calls `getAvailableProducts()` on mount
2. **Enrichment**: Each product is enriched with:
   - Extracted features from metadata
   - Derived plan ID
   - Recommended status
3. **Sorting**: Products are sorted by plan order (free → basic → professional)
4. **Rendering**: Features and prices are displayed dynamically from the fetched data

## Code Structure

- `lib/stripe/entitlements.ts` - Feature extraction and product enrichment utilities
- `lib/stripe/client.ts` - Stripe Firebase Extension integration
- `components/landing/Pricing.tsx` - Dynamic pricing component

## Adding New Features

To add a new feature:

1. Add the feature key to `FEATURE_KEYS` in `lib/stripe/entitlements.ts`:
   ```typescript
   export const FEATURE_KEYS = {
     // ... existing keys
     NEW_FEATURE: "new_feature",
   } as const;
   ```

2. Add feature configuration to `FEATURE_CONFIGS`:
   ```typescript
   {
     key: FEATURE_KEYS.NEW_FEATURE,
     displayName: "שם התכונה",
     type: "boolean" | "number" | "text",
   }
   ```

3. Add the metadata field to your Stripe products:
   - Go to each product in Stripe Dashboard
   - Add metadata: `new_feature` with appropriate value
   - Save

4. The feature will automatically appear in the pricing table!

## Testing

To verify the setup:

1. Check Firebase Console > Firestore > `products` collection
2. Verify all products are synced with correct metadata
3. Check `products/{productId}/prices` for pricing data
4. Visit the pricing page and verify features display correctly
5. Test checkout flow for each plan

## Troubleshooting

**Products not showing:**
- Verify Stripe webhook is configured correctly
- Check Firebase Extension logs for sync errors
- Ensure products are marked as "Active" in Stripe

**Features missing:**
- Verify metadata keys match exactly (case-sensitive)
- Check product metadata in Stripe Dashboard
- Review browser console for errors

**Prices incorrect:**
- Verify price `unit_amount` is in cents (multiply by 100)
- Check price is marked as active
- Ensure correct billing interval (month/year)
