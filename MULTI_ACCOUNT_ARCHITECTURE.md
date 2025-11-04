# Multi-Account Architecture Reference Guide

Quick reference for the new multi-account architecture.

---

## Database Structure

### Before (Single Account)

```
users/{userId}/
  googleRefreshToken: string
  selectedBusinessId: string
  businesses/{businessId}/
    googleAccountId: string
    reviews/{reviewId}/
```

### After (Multi-Account)

```
users/{userId}/
  selectedAccountId: string
  selectedBusinessId: string
  accounts/{accountId}/
    email: string
    accountName: string
    googleRefreshToken: string
    connectedAt: Timestamp
    lastSynced?: Timestamp

    businesses/{businessId}/
      (googleAccountId REMOVED - implicit from path)
      reviews/{reviewId}/
```

---

## Key Function Signatures

### Account Operations (`lib/firebase/accounts.ts`)

```typescript
// Create account
createAccount(userId: string, accountData: {
  email: string,
  accountName: string,
  googleRefreshToken: string
}): Promise<string>

// Get all accounts for user
getUserAccounts(userId: string): Promise<Account[]>

// Get specific account
getAccount(userId: string, accountId: string): Promise<Account | null>

// Update account
updateAccount(userId: string, accountId: string, data: Partial<Account>): Promise<void>

// Delete account (cascades to businesses and reviews)
deleteAccount(userId: string, accountId: string): Promise<void>

// Get/update refresh token
getAccountGoogleRefreshToken(userId: string, accountId: string): Promise<string | null>
updateAccountGoogleRefreshToken(userId: string, accountId: string, token: string): Promise<void>
```

### Business Operations (`lib/firebase/business.ts`)

```typescript
// Get businesses for specific account
getAccountBusinesses(userId: string, accountId: string): Promise<Business[]>

// Get all businesses across all accounts
getAllUserBusinesses(userId: string): Promise<Business[]>

// Get specific business
getBusiness(userId: string, accountId: string, businessId: string): Promise<Business | null>

// Create business (requires accountId now)
createBusiness(data: {
  userId: string,
  accountId: string,  // NEW REQUIRED FIELD
  googleBusinessId: string,
  name: string,
  address: string,
  // ... other fields
}): Promise<Business>

// Update business
updateBusiness(
  userId: string,
  accountId: string,  // NEW PARAMETER
  businessId: string,
  data: BusinessUpdateInput
): Promise<Business>

// Delete business
deleteBusiness(
  userId: string,
  accountId: string,  // NEW PARAMETER
  businessId: string
): Promise<void>
```

### Review Operations (TO BE UPDATED)

```typescript
// All review functions will need accountId parameter
getReviews(userId: string, accountId: string, businessId: string): Promise<Review[]>
createReview(userId: string, accountId: string, businessId: string, data: ReviewData): Promise<Review>
updateReview(userId: string, accountId: string, businessId: string, reviewId: string, data: UpdateData): Promise<Review>
```

---

## Context Architecture

### AccountContext (TO BE CREATED)

```typescript
interface AccountContextType {
  currentAccount: Account | null;
  accounts: Account[];
  selectedAccountId: string | null;
  isLoading: boolean;
  selectAccount: (accountId: string) => void;
  refreshAccounts: () => Promise<void>;
}
```

### BusinessContext (TO BE UPDATED)

```typescript
interface BusinessContextType {
  currentBusiness: Business | null;
  currentAccount: Account | null; // NEW - from AccountContext
  businesses: Business[]; // Filtered by currentAccount
  selectedBusinessId: string | null;
  selectBusiness: (businessId: string) => void;
  refreshBusinesses: () => Promise<void>;
}
```

---

## OAuth Flow Changes

### Before

1. User clicks "Connect Google Account"
2. OAuth redirects to Google
3. Callback receives code
4. Exchange for tokens
5. Store `refreshToken` at `users/{userId}/googleRefreshToken`
6. Fetch businesses
7. Create businesses at `users/{userId}/businesses/{businessId}`

### After

1. User clicks "Connect Google Account"
2. OAuth redirects to Google (state includes userId)
3. Callback receives code
4. Exchange for tokens
5. **Create account at `users/{userId}/accounts/{accountId}`**
6. **Store `refreshToken` at account level**
7. Fetch businesses using account's token
8. Create businesses at `users/{userId}/accounts/{accountId}/businesses/{businessId}`

---

## Component Hierarchy

### New UI Flow

```
AccountToggler (Header)
  ├─> Select Account
  │   └─> Updates AccountContext
  │
  └─> "Add Account" → OAuth Flow

BusinessToggler (Header)
  ├─> Shows businesses from currentAccount only
  └─> Select Business

Dashboard/Businesses Page
  ├─> ConnectedAccountsList
  │   ├─> For each account:
  │   │   ├─> Account info (email, name)
  │   │   ├─> Businesses under this account
  │   │   └─> "Add Business to This Account" button
  │   └─> "Add New Account" button → OAuth Flow
  │
  └─> ConnectAccountCard (when connecting new account)
      ├─> Step 1: OAuth (creates account)
      ├─> Step 2: Select businesses
      └─> Step 3: Done
```

---

## Migration Checklist

When updating existing code that uses business operations:

- [ ] Add `accountId` parameter to function calls
- [ ] Get `accountId` from `AccountContext` or `currentAccount`
- [ ] Update Firestore paths to include `accounts/{accountId}`
- [ ] Update import statements if function names changed
- [ ] Test with multiple accounts

### Example Migration

**Before:**

```typescript
const businesses = await getUserBusinesses(userId);
const business = await getBusiness(userId, businessId);
await updateBusiness(userId, businessId, data);
```

**After:**

```typescript
const businesses = await getAccountBusinesses(userId, accountId);
const business = await getBusiness(userId, accountId, businessId);
await updateBusiness(userId, accountId, businessId, data);
```

---

## Common Patterns

### Get Account from Context

```typescript
const { currentAccount } = useAccount();
if (!currentAccount) return;
const accountId = currentAccount.id;
```

### Create Business Under Current Account

```typescript
const { user } = useAuth();
const { currentAccount } = useAccount();

if (!user || !currentAccount) return;

await createBusiness({
  userId: user.uid,
  accountId: currentAccount.id,
  googleBusinessId: "...",
  name: "...",
  address: "...",
  // ...
});
```

### Fetch Reviews for Current Business

```typescript
const { user } = useAuth();
const { currentAccount, currentBusiness } = useBusiness();

if (!user || !currentAccount || !currentBusiness) return;

const reviews = await getReviews(
  user.uid,
  currentAccount.id,
  currentBusiness.id
);
```

---

## Cloud Function Trigger Path

### Before

```typescript
export const onReviewCreate = onDocumentCreated(
  "users/{userId}/businesses/{businessId}/reviews/{reviewId}",
  async (event) => {
    const { userId, businessId, reviewId } = event.params;
    // ...
  }
);
```

### After

```typescript
export const onReviewCreate = onDocumentCreated(
  "users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}",
  async (event) => {
    const { userId, accountId, businessId, reviewId } = event.params;

    // Get account's refresh token
    const account = await getAccount(userId, accountId);
    const refreshToken = account.googleRefreshToken;

    // Use for API calls...
  }
);
```

---

## TypeScript Types Reference

```typescript
// Account
interface Account {
  id: string;
  email: string;
  accountName: string;
  googleRefreshToken: string;
  connectedAt: Timestamp;
  lastSynced?: Timestamp;
}

// Account with businesses
interface AccountWithBusinesses extends Account {
  businesses: Business[];
}

// User (updated)
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  stripeId?: string;
  stripeLink?: string;
  selectedAccountId?: string; // NEW
  selectedBusinessId?: string;
}

// Business (updated)
interface Business {
  id: string;
  // googleAccountId: REMOVED
  googleBusinessId: string;
  name: string;
  address: string;
  // ... rest unchanged
}
```

---

## Security Rules Summary

```javascript
match /users/{userId}/accounts/{accountId} {
  allow read: if isOwner(userId);
  allow create: if isOwner(userId) && validAccountData();
  allow update: if isOwner(userId);
  allow delete: if isOwner(userId);

  match /businesses/{businessId} {
    allow read: if isOwner(userId);
    allow create: if isOwner(userId) && validBusinessData();
    allow update: if isOwner(userId);
    allow delete: if isOwner(userId);

    match /reviews/{reviewId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && validReviewData();
      allow update: if isOwner(userId);
      allow delete: if false; // Keep for history
    }
  }
}
```

---

## Testing Multi-Account Scenarios

1. **Single Account**:
   - Connect one Google account
   - Add businesses
   - Should work exactly like before (but with account layer)

2. **Multiple Accounts**:
   - Connect first account → add businesses
   - Connect second account → add businesses
   - Switch between accounts
   - Verify businesses are grouped correctly

3. **Token Management**:
   - Each account uses its own refresh token
   - Posting replies uses correct account's token
   - Token refresh updates correct account

4. **Deletion**:
   - Delete business → only that business removed
   - Delete account → all businesses under that account removed
   - Reviews are cascaded

---

**Quick Start for Developers**:

1. Read [MULTI_ACCOUNT_MIGRATION_PROGRESS.md](MULTI_ACCOUNT_MIGRATION_PROGRESS.md) for current status
2. Reference this document for architecture patterns
3. Follow the function signatures when updating code
4. Test with multiple accounts before considering complete

---

**Last Updated**: 2025-11-04
