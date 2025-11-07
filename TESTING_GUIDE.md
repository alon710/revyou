# Testing Guide - MVC Refactoring

## ✅ Refactoring Complete

All phases of the MVC refactoring have been implemented. This guide helps verify that everything works correctly.

---

## 🧪 Testing Checklist

### **Phase 1: Build Verification**

#### 1.1 TypeScript Compilation

```bash
# From project root
npm run build
# Or
yarn build

# Should complete without errors
```

#### 1.2 Cloud Functions Build

```bash
cd functions
npm run build

# Verify:
# - No TypeScript errors
# - Types copied from lib/types/ correctly
# - Build output in functions/lib/
```

---

### **Phase 2: API Routes Testing**

#### 2.1 User Routes

**GET /api/users/[userId]**

```bash
# Test getting user
curl -X GET http://localhost:3000/api/users/{userId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with user object
```

**PUT /api/users/[userId]**

```bash
# Test updating user
curl -X PUT http://localhost:3000/api/users/{userId} \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "New Name"}'

# Expected: 200 with updated user object
```

#### 2.2 Account Routes

**GET /api/users/[userId]/accounts**

```bash
# Test listing accounts (with filters)
curl -X GET "http://localhost:3000/api/users/{userId}/accounts?limit=10&orderBy=connectedAt&orderDirection=desc" \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with accounts array
```

**GET /api/users/[userId]/accounts/[accountId]**

```bash
# Test getting single account
curl -X GET http://localhost:3000/api/users/{userId}/accounts/{accountId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with account object
```

**PUT /api/users/[userId]/accounts/[accountId]**

```bash
# Test updating account
curl -X PUT http://localhost:3000/api/users/{userId}/accounts/{accountId} \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{"googleAccountName": "Updated Name"}'

# Expected: 200 with updated account
```

**DELETE /api/users/[userId]/accounts/[accountId]**

```bash
# Test deleting account
curl -X DELETE http://localhost:3000/api/users/{userId}/accounts/{accountId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with success: true
```

#### 2.3 Business Routes

**GET /api/users/[userId]/accounts/[accountId]/businesses**

```bash
# Test listing businesses with filters
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses?connected=true&limit=20&orderBy=name&orderDirection=asc" \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with businesses array
```

**POST /api/users/[userId]/accounts/[accountId]/businesses**

```bash
# Test creating business
curl -X POST http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{
    "googleBusinessId": "accounts/123/locations/456",
    "name": "Test Business",
    "address": "123 Main St",
    "phoneNumber": "555-0100",
    "emailOnNewReview": true
  }'

# Expected: 201 with created business
```

**GET /api/users/[userId]/accounts/[accountId]/businesses/[businessId]**

```bash
# Test getting single business
curl -X GET http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with business object
```

**PUT /api/users/[userId]/accounts/[accountId]/businesses/[businessId]**

```bash
# Test updating business
curl -X PUT http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId} \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Business Name"}'

# Expected: 200 with updated business
```

**DELETE /api/users/[userId]/accounts/[accountId]/businesses/[businessId]**

```bash
# Test deleting business
curl -X DELETE http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with success: true
```

#### 2.4 Review Routes (MOST IMPORTANT)

**GET /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews**

```bash
# Test listing reviews with filters
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?replyStatus=pending&rating=1&rating=2&limit=20&orderBy=receivedAt&orderDirection=desc" \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with reviews array

# Test different filter combinations:
# 1. Filter by status only:
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?replyStatus=pending" \
  -H "Cookie: session={your-session-cookie}"

# 2. Filter by rating only:
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?rating=5" \
  -H "Cookie: session={your-session-cookie}"

# 3. Filter by date range:
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?dateFrom=2025-01-01&dateTo=2025-12-31" \
  -H "Cookie: session={your-session-cookie}"

# 4. Combined filters:
curl -X GET "http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews?replyStatus=posted&rating=4&rating=5&limit=10" \
  -H "Cookie: session={your-session-cookie}"
```

**GET /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]**

```bash
# Test getting single review
curl -X GET http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId} \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with review object
```

**PUT /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]**

```bash
# Test updating review
curl -X PUT http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId} \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{"replyStatus": "rejected"}'

# Expected: 200 with updated review
```

**POST /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]/generate**

```bash
# Test generating AI reply
curl -X POST http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}/generate \
  -H "Cookie: session={your-session-cookie}"

# Expected: 200 with review including aiReply field
```

**POST /api/users/[userId]/accounts/[accountId]/businesses/[businessId]/reviews/[reviewId]/post**

```bash
# Test posting reply to Google
curl -X POST http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}/post \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{"reply": "Optional custom reply"}'

# Expected: 200 with success: true and updated review
```

---

### **Phase 3: Frontend Testing**

#### 3.1 Reviews Page

1. Navigate to `/dashboard/businesses/[businessId]/reviews`
2. Verify:
   - ✅ Reviews load without Firestore errors
   - ✅ Reviews are sorted by receivedAt desc
   - ✅ All review data displays correctly
   - ✅ No console errors related to Firestore imports

#### 3.2 Browser Network Tab

1. Open DevTools → Network tab
2. Navigate to reviews page
3. Verify:
   - ✅ XHR request to `/api/users/.../reviews` endpoint
   - ✅ No direct Firestore SDK requests
   - ✅ Response includes `reviews` array and `count`

---

### **Phase 4: Cloud Functions Testing**

#### 4.1 Build Test

```bash
cd functions
npm run build

# Verify:
# - ✅ No TypeScript errors
# - ✅ Types copied from ../lib/types/
# - ✅ All imports resolve correctly
```

#### 4.2 Emulator Test

```bash
cd functions
npm run serve

# Verify:
# - ✅ Functions deploy to emulator without errors
# - ✅ onGoogleReviewNotification function loads
# - ✅ onReviewCreate function loads
```

#### 4.3 Function Execution

Test the notification webhook:

```bash
# Trigger a test review notification (if you have test data)
# Or check logs when real notification arrives
firebase functions:log

# Verify:
# - ✅ Review created successfully
# - ✅ No type errors
# - ✅ All fields populated correctly
```

---

### **Phase 5: Integration Testing**

#### 5.1 End-to-End Review Flow

1. **Receive review notification** (webhook triggers function)
2. **Review appears in Firestore** via Cloud Function
3. **Review displays in UI** fetched via API
4. **Generate AI reply** via API route
5. **Post reply to Google** via API route

**Verification Points:**

- ✅ No type mismatches
- ✅ All data persists correctly
- ✅ UI updates properly
- ✅ Google API integration works

#### 5.2 Filter Testing

Test all filter combinations:

```javascript
// In browser console or via API:
const filters = [
  { replyStatus: ["pending"] },
  { rating: [1, 2] },
  { replyStatus: ["posted"], rating: [4, 5] },
  { dateFrom: "2025-01-01", dateTo: "2025-12-31" },
  { limit: 10, offset: 0 },
  { orderBy: "receivedAt", orderDirection: "desc" },
  { orderBy: "rating", orderDirection: "asc" },
];

// Test each filter via API and verify results
```

---

### **Phase 6: Error Handling**

#### 6.1 Authorization Tests

```bash
# Test accessing another user's data (should fail)
curl -X GET http://localhost:3000/api/users/{otherUserId}/accounts \
  -H "Cookie: session={your-session-cookie}"

# Expected: 403 Forbidden
```

#### 6.2 Invalid Data Tests

```bash
# Test creating business without required fields
curl -X POST http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses \
  -H "Cookie: session={your-session-cookie}" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 500 with error message
```

#### 6.3 Not Found Tests

```bash
# Test getting non-existent resource
curl -X GET http://localhost:3000/api/users/{userId}/accounts/{accountId}/businesses/nonexistent \
  -H "Cookie: session={your-session-cookie}"

# Expected: 404 with "not found" error
```

---

## 🔍 **Common Issues & Solutions**

### Issue 1: Type Errors in Cloud Functions

**Problem:** `Cannot find module '@/lib/types'`
**Solution:** Run `npm run build` in functions directory to copy types

### Issue 2: Route Not Found (404)

**Problem:** API route returns 404
**Solution:** Verify Next.js server restarted after creating routes

### Issue 3: Firestore Permission Errors

**Problem:** "Missing or insufficient permissions"
**Solution:** Check Firestore security rules allow authenticated access

### Issue 4: Query Filter Not Working

**Problem:** Filters not applied to results
**Solution:**

- Verify Firestore indexes exist (check firestore.indexes.json)
- Check query-builder logic
- Verify parseSearchParams correctly parses URL params

---

## ✅ **Success Criteria**

The refactoring is successful if:

1. ✅ **All API routes return 200** for valid requests
2. ✅ **Frontend loads reviews** without direct Firestore access
3. ✅ **Cloud Functions build** without errors
4. ✅ **Filters work** for all entity types
5. ✅ **Type safety maintained** (no `any` types, no type errors)
6. ✅ **One-liner query parsing** works in all routes
7. ✅ **Hierarchical paths** reflect Firestore structure
8. ✅ **No code duplication** (single source for CRUD operations)

---

## 📊 **Testing Metrics**

Track these metrics:

| Metric                       | Target                | Status     |
| ---------------------------- | --------------------- | ---------- |
| API route test coverage      | 100% of routes tested | ⏳ Pending |
| Frontend Firestore calls     | 0 direct calls        | ⏳ Pending |
| Type errors                  | 0 errors              | ⏳ Pending |
| Filter combinations tested   | All 7+ combinations   | ⏳ Pending |
| Cloud Function build success | ✅ Success            | ⏳ Pending |

---

## 🚀 **Next Steps After Testing**

Once all tests pass:

1. **Deploy to staging** environment
2. **Run smoke tests** on staging
3. **Monitor Cloud Functions logs** for errors
4. **Check API response times** (should be fast due to indexes)
5. **Update documentation** with new API structure
6. **Train team** on new controller/repository patterns

---

## 📝 **Test Report Template**

Use this template to document your testing:

```markdown
## Test Session: [Date]

### Environment:

- Node version:
- Next.js version:
- Firebase SDK version:

### Test Results:

#### API Routes

- [ ] User routes
- [ ] Account routes
- [ ] Business routes
- [ ] Review routes

#### Filters

- [ ] replyStatus filter
- [ ] rating filter
- [ ] date range filter
- [ ] sorting options
- [ ] pagination

#### Frontend

- [ ] Reviews page loads
- [ ] No Firestore direct access
- [ ] UI displays correctly

#### Cloud Functions

- [ ] Build successful
- [ ] Types imported correctly
- [ ] Functions deploy to emulator

### Issues Found:

1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Open/Fixed

### Conclusion:

✅ All tests passed / ❌ Tests failed (see issues)
```

---

Generated: 2025-11-07
