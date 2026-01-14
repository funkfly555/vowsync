# Testing Requirements

## Overview

Comprehensive testing strategy to ensure quality and reliability.

---

## Test Pyramid

```
        /\
       /  \    E2E Tests (10%)
      /____\   
     /      \  Integration Tests (30%)
    /________\ 
   /          \ Unit Tests (60%)
  /__________  \
```

---

## 1. Unit Tests

**Framework:** Vitest or Jest

**Coverage Target:** 80%+

**Test:**
- Business logic functions
- Calculations (bar orders, equipment totals)
- Validation functions
- Utility functions

**Examples:**
```typescript
describe('calculateTotalServings', () => {
  it('should calculate correct servings for 5-hour event', () => {
    const result = calculateTotalServings(5, 2, 2, 1);
    expect(result).toBe(7); // (2×2) + (3×1) = 7
  });
});

describe('calculateUnitsNeeded', () => {
  it('should round up to nearest whole unit', () => {
    const result = calculateUnitsNeeded(7, 0.4, 150, 4);
    expect(result.unitsNeeded).toBe(105); // CEIL(420/4)
  });
});
```

---

## 2. Integration Tests

**Framework:** Vitest + Supabase test instance

**Coverage:** All API endpoints

**Test:**
- CRUD operations
- RLS policies
- Database triggers
- Complex queries

**Examples:**
```typescript
describe('Guest API', () => {
  it('should create guest and link to wedding', async () => {
    const guest = await createGuest(weddingId, guestData);
    expect(guest.wedding_id).toBe(weddingId);
  });
  
  it('should not allow access to other consultant\'s guests', async () => {
    await expect(
      getGuest(otherConsultantGuestId)
    ).rejects.toThrow('Permission denied');
  });
});
```

---

## 3. E2E Tests

**Framework:** Playwright or Cypress

**Coverage:** Critical user journeys

**Test Scenarios:**

### Journey 1: Create Wedding
1. Login
2. Create new wedding
3. Add 3 events
4. Verify events appear in timeline

### Journey 2: Manage Guests
1. Navigate to guests
2. Add 5 guests (CSV import)
3. Assign to Event 1
4. Set meal selections
5. Generate guest list report

### Journey 3: Vendor Payment
1. Add vendor
2. Create payment schedule
3. Mark first payment as paid
4. Verify budget updates

### Journey 4: Generate Function Sheet
1. Complete wedding setup
2. Generate Function Sheet
3. Verify all sections present
4. Download PDF

---

## 4. Database Tests

**Test:**
- All triggers fire correctly
- Calculated fields accurate
- RLS policies enforce correctly
- Cascading deletes work

**Example:**
```sql
-- Test RLS
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-1-uuid';

SELECT * FROM guests; -- Should only see user-1's guests
```

---

## 5. Performance Tests

**Tools:** Lighthouse, k6

**Metrics:**
- Page load < 2 seconds
- First Contentful Paint < 1.2s
- Time to Interactive < 3.5s
- API response < 200ms (95th percentile)

**Load Testing:**
- 100 concurrent users
- 1000 guests per wedding
- 10 events per wedding
- Document generation under load

---

## 6. Accessibility Tests

**Tools:** axe, Lighthouse

**Requirements:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatible
- Color contrast 4.5:1 minimum
- Touch targets 44px minimum

**Manual Testing:**
- Test with VoiceOver (macOS)
- Test with NVDA (Windows)
- Test with keyboard only
- Test on mobile devices

---

## 7. Browser Testing

**Desktop:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Mobile:**
- iOS Safari
- Android Chrome

---

## 8. Regression Testing

**When:**
- Before every release
- After bug fixes
- After database migrations

**What:**
- Run full test suite
- Verify no existing features broken
- Check performance hasn't degraded

---

## 9. User Acceptance Testing (UAT)

**Process:**
1. Deploy to staging
2. Consultant tests with real data
3. Collect feedback
4. Fix issues
5. Re-test
6. Approve for production

---

## Test Data

**Fixtures:**
- Sample wedding (complete)
- 170 guests
- 7 events
- 12 vendors
- Complete budget
- Repurposing instructions

**Reset Between Tests:**
- Clear database
- Reload fixtures
- Fresh authentication

---

## CI/CD Pipeline

```yaml
on: [push, pull_request]

jobs:
  test:
    - Run linter (ESLint)
    - Run type check (TypeScript)
    - Run unit tests (Vitest)
    - Run integration tests
    - Check coverage (>80%)
    
  e2e:
    - Deploy to test environment
    - Run E2E tests (Playwright)
    - Generate report
    
  deploy:
    if: tests pass AND branch is main
    - Deploy to production
```

---

## Testing Checklist

### Before Release
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass on all browsers
- [ ] Accessibility tests pass
- [ ] Performance tests pass
- [ ] Manual UAT completed
- [ ] Database migrations tested
- [ ] Rollback plan prepared

### After Release
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Document issues
- [ ] Plan hotfixes if needed

---

**Testing Goal:** Zero critical bugs in production, <1% error rate.

