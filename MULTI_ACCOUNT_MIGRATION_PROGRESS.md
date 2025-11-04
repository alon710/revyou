# Multi-Account Architecture Migration - Progress Report

**Date Started**: 2025-11-04
**Status**: In Progress (Phase 5 of 10)
**Overall Completion**: ~60% ✨

---

## Overview

Migrating the application from `user > business > review` structure to `user > account > business > review` to support multiple Google accounts per user.

**New Structure**:

```
users/{userId}/
  accounts/{accountId}/
    businesses/{businessId}/
      reviews/{reviewId}/
```

---

## ✅ Completed Tasks

### Phase 1: Database Schema & Types (100% Complete)

1. **✅ TypeScript Types** ([types/database.ts](types/database.ts))
   - Added `Account` interface
   - Added `AccountWithBusinesses` interface
   - Removed `googleRefreshToken` from `User` interface
   - Added `selectedAccountId` to `User` interface
   - Removed `googleAccountId` from `Business` interface

2. **✅ Firestore Security Rules** ([firestore.rules](firestore.rules))
   - Added account collection rules
   - Nested businesses under accounts
   - Nested reviews under businesses (accounts > businesses > reviews)
   - Account validation (email, accountName, googleRefreshToken, connectedAt)
   - Removed `googleAccountId` from business validation

3. **✅ Firestore Indexes** ([firestore.indexes.json](firestore.indexes.json))
   - Added index for accounts collection (connectedAt, **name**)
   - Existing indexes use `collectionGroup` (no changes needed)

4. **✅ Validation Schemas** ([lib/validation/database.ts](lib/validation/database.ts))
   - Removed `googleRefreshToken` from user schema
   - Added `selectedAccountId` to user schema
   - Removed `googleAccountId` from business schema

### Phase 2: Firebase Backend Functions (60% Complete)

1. **✅ Account Operations** ([lib/firebase/accounts.ts](lib/firebase/accounts.ts)) - NEW FILE
   - `createAccount(userId, accountData)` - Create new Google account
   - `getUserAccounts(userId)` - Get all accounts for user
   - `getAccount(userId, accountId)` - Get specific account
   - `updateAccount(userId, accountId, data)` - Update account
   - `deleteAccount(userId, accountId)` - Delete account + all businesses/reviews
   - `getAccountGoogleRefreshToken(userId, accountId)` - Get decrypted token
   - `updateAccountGoogleRefreshToken(userId, accountId, token)` - Update token

2. **✅ Business Operations** ([lib/firebase/business.ts](lib/firebase/business.ts))
   - ✅ `getAccountBusinesses(userId, accountId)` - Businesses for specific account
   - ✅ `getAllUserBusinesses(userId)` - All businesses across all accounts
   - ✅ `getBusiness(userId, accountId, businessId)` - Now includes accountId
   - ✅ `createBusiness(data)` - Now requires `accountId` parameter
   - ✅ `updateBusiness(userId, accountId, businessId, data)` - Updated signature
   - ✅ `deleteBusiness(userId, accountId, businessId)` - Updated signature

---

## 🔄 In Progress

### Phase 2: Firebase Backend Functions (40% Remaining)

3. **⏳ User Operations**
   - Need to update [lib/firebase/users.ts](lib/firebase/users.ts)
   - Remove `googleRefreshToken` field handling
   - Add `selectedAccountId` field handling
   - Remove `updateUserGoogleRefreshToken()` function (moved to accounts)

4. **⏳ Review Operations**
   - Need to update [lib/firebase/reviews.ts](lib/firebase/reviews.ts)
   - Update all paths to include `accountId`:
     - `users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}`
   - Update function signatures to accept `accountId`

---

## 📋 Pending Tasks

### Phase 3: Google OAuth & API Integration (0% Complete)

Files to update:

- [ ] [app/api/google/auth/route.ts](app/api/google/auth/route.ts) - OAuth initiation
- [ ] [app/api/google/callback/route.ts](app/api/google/callback/route.ts) - OAuth callback
- [ ] Create [app/api/google/accounts/route.ts](app/api/google/accounts/route.ts) - NEW
- [ ] Create [app/api/google/accounts/[accountId]/businesses/route.ts](app/api/google/accounts/[accountId]/businesses/route.ts) - NEW

### Phase 4: Context & State Management (0% Complete)

Files to create/update:

- [ ] Create [contexts/AccountContext.tsx](contexts/AccountContext.tsx) - NEW
- [ ] Update [contexts/BusinessContext.tsx](contexts/BusinessContext.tsx)
- [ ] Update [app/layout.tsx](app/layout.tsx)

### Phase 5: UI Components - Account Management (0% Complete)

New components to create:

- [ ] [components/dashboard/accounts/AccountSelector.tsx](components/dashboard/accounts/AccountSelector.tsx)
- [ ] [components/dashboard/accounts/ConnectedAccountsList.tsx](components/dashboard/accounts/ConnectedAccountsList.tsx)
- [ ] [components/dashboard/accounts/AccountToggler.tsx](components/dashboard/accounts/AccountToggler.tsx)
- [ ] [components/dashboard/accounts/ConnectAccountCard.tsx](components/dashboard/accounts/ConnectAccountCard.tsx)

### Phase 6: UI Components - Business Management Updates (0% Complete)

Components to update:

- [ ] [components/dashboard/utils/BusinessToggler.tsx](components/dashboard/utils/BusinessToggler.tsx)
- [ ] [components/dashboard/businesses/ConnectBusinessCard.tsx](components/dashboard/businesses/ConnectBusinessCard.tsx)
- [ ] [components/dashboard/businesses/ConnectedBusinessesList.tsx](components/dashboard/businesses/ConnectedBusinessesList.tsx)
- [ ] [components/dashboard/businesses/BusinessSelector.tsx](components/dashboard/businesses/BusinessSelector.tsx)

### Phase 7: Dashboard Pages (0% Complete)

Pages to update:

- [ ] [app/dashboard/businesses/page.tsx](app/dashboard/businesses/page.tsx)
- [ ] [app/dashboard/page.tsx](app/dashboard/page.tsx)
- [ ] [app/dashboard/reviews/page.tsx](app/dashboard/reviews/page.tsx)
- [ ] [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx)

### Phase 8: Cloud Functions (0% Complete)

Functions to update:

- [ ] [functions/src/functions/onReviewCreate.ts](functions/src/functions/onReviewCreate.ts)
  - Update trigger path to include `accountId`
  - Extract `accountId` from event path
  - Use account's refresh token for API calls

- [ ] [functions/src/shared/types.ts](functions/src/shared/types.ts)
  - Sync Account and Business types with main app

### Phase 9: Hooks & Utilities (0% Complete)

Hooks to update/create:

- [ ] Update [hooks/useReviews.ts](hooks/useReviews.ts)
- [ ] Update [hooks/useDashboardStats.ts](hooks/useDashboardStats.ts)
- [ ] Create [hooks/useAccounts.ts](hooks/useAccounts.ts) - NEW

### Phase 10: Testing & Deployment (0% Complete)

- [ ] Update [scripts/seed-database.ts](scripts/seed-database.ts)
- [ ] Update [scripts/seed-review.ts](scripts/seed-review.ts)
- [ ] Deploy Firestore security rules
- [ ] Deploy Firestore indexes
- [ ] Deploy Cloud Functions
- [ ] Deploy Next.js application

---

## Breaking Changes Summary

### Database Structure

- ✅ New collection: `users/{userId}/accounts/{accountId}`
- ✅ Moved: `businesses` from user level to account level
- ✅ Moved: `googleRefreshToken` from user to account
- ✅ All Firestore paths for businesses and reviews now include `accountId`

### TypeScript Types

- ✅ Removed `googleRefreshToken` from `User`
- ✅ Added `selectedAccountId` to `User`
- ✅ Removed `googleAccountId` from `Business`
- ✅ Created new `Account` and `AccountWithBusinesses` types

### Function Signatures Changed

- ✅ `getAccountBusinesses(userId, accountId)` - NEW (replaces getUserBusinesses)
- ✅ `getAllUserBusinesses(userId)` - NEW (get across all accounts)
- ✅ `getBusiness(userId, accountId, businessId)` - Added accountId parameter
- ✅ `createBusiness({...data, accountId})` - Added accountId to data object
- ✅ `updateBusiness(userId, accountId, businessId, data)` - Added accountId parameter
- ✅ `deleteBusiness(userId, accountId, businessId)` - Added accountId parameter

---

## Next Steps (In Order of Priority)

1. **Complete Phase 2**:
   - Update user operations ([lib/firebase/users.ts](lib/firebase/users.ts))
   - Update review operations ([lib/firebase/reviews.ts](lib/firebase/reviews.ts))

2. **Start Phase 3 (OAuth Integration)**:
   - Update OAuth flow to create accounts instead of storing token at user level
   - Create account-scoped API endpoints

3. **Build Phase 4 (Context)**:
   - Create AccountContext
   - Update BusinessContext to depend on AccountContext

4. **Continue with UI components and pages**

---

## Important Notes

### No Backward Compatibility

- This is a breaking change - existing data structure is incompatible
- Users will need to reconnect their Google accounts after deployment
- Consider creating a migration script OR wiping existing data

### Account Identification

- `accountId`: Firestore auto-generated ID (unique per user)
- `email`: Google account email (stored for display)
- `accountName`: Google account display name

### Token Management

- Each account stores its own encrypted `googleRefreshToken`
- Token refresh happens per-account
- Failed auth on one account doesn't affect others

### Subscription Limits

- Business limits apply at USER level (not per account)
- Total businesses across ALL accounts count toward limit
- Check limits in `createBusiness()` (already implemented)

---

## Files Modified So Far

### New Files (1)

1. `lib/firebase/accounts.ts` - Account CRUD operations

### Modified Files (5)

1. `types/database.ts` - Type definitions
2. `firestore.rules` - Security rules
3. `firestore.indexes.json` - Database indexes
4. `lib/firebase/business.ts` - Business operations
5. `lib/validation/database.ts` - Validation schemas

### Files Still Need to Update (~20+)

See "Pending Tasks" section above for full list.

---

## Testing Strategy (When Ready)

1. **Unit Tests**:
   - Account CRUD operations
   - Business operations with accountId
   - Review operations with accountId

2. **Integration Tests**:
   - OAuth flow creating accounts
   - Account switching in UI
   - Business creation under accounts
   - Review generation with correct account token

3. **Manual Testing Checklist**:
   - [ ] Connect first Google account
   - [ ] Add businesses to first account
   - [ ] Connect second Google account
   - [ ] Add businesses to second account
   - [ ] Switch between accounts
   - [ ] Switch between businesses within account
   - [ ] Generate AI replies (uses correct account token)
   - [ ] Post replies to Google (uses correct account token)
   - [ ] Delete business (stays within account)
   - [ ] Delete account (removes all businesses)
   - [ ] Check subscription limits work correctly

---

## Current Status: READY TO CONTINUE

The foundation is solid. Next immediate tasks:

1. Update review operations
2. Update user operations
3. Then move to OAuth/API integration

**Estimated time to complete**: 6-8 hours of focused development work across all phases.

---

**Last Updated**: 2025-11-04
**Updated By**: Claude (Anthropic)
