# Vowsync Development Process Guide
**Version:** 2.0 (Enhanced after Phase 9)  
**Last Updated:** January 15, 2026  
**Status:** AUTHORITATIVE REFERENCE - Always Read First

---

## 🎯 PURPOSE OF THIS DOCUMENT

This document defines the **exact process** that must be followed by every Claude instance working on Vowsync. It captures critical learnings from 9+ phases of development and prevents recurring mistakes.

**For Claude Assistants:**
- Read this document at the start of EVERY new conversation
- Follow this process exactly - no shortcuts
- When in doubt, refer back to this guide
- This is MORE important than trying to be helpful quickly

**For the User (Funk):**
- This document is uploaded to the "SaaS Wedding Planner" Claude Project
- All future conversations will reference this automatically
- Update this document when new learnings emerge

---

## 📚 REQUIRED READING ORDER

Every Claude instance must read these documents in this order:

1. **THIS DOCUMENT FIRST** - Vowsync Development Process Guide
2. **Project PRDs** - Located at `/mnt/project/*.md`:
   - 01-EXECUTIVE-SUMMARY.md
   - 02-DESIGN-SYSTEM.md
   - 03-DATABASE-SCHEMA.md
   - 04-FEATURES-REQUIREMENTS.md
   - 05-PAGE-LAYOUTS.md
   - 06-BUSINESS-RULES.md
   - 07-API-SUMMARY.md
   - 08-SECURITY.md
   - 09-TESTING.md
   - 10-IMPLEMENTATION-CHECKLIST.md
3. **Current Handover Document** - Shows what phases are complete
4. **BACKLOG.md** - Known issues and future enhancements

---

## 🏗️ PROJECT CONTEXT

**Project:** Vowsync - Wedding Planning SaaS Application  
**Tech Stack:** React 18, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (PostgreSQL)  
**Working Directory:** `C:\Users\tjpel\vowsync`  
**Test Credentials:** test@example.com / password123  
**Development Framework:** GitHub Spec Kit (4-step process)  
**Implementation Tool:** Claude Code (VS Code extension with agentic coding)

---

## ⚠️ CRITICAL PRINCIPLE: ONE STEP AT A TIME

**DO NOT:**
- Generate multiple Spec Kit commands at once
- Skip ahead to implementation without user confirmation
- Assume what the user wants next

**DO:**
- Generate ONE prompt per response
- Wait for user to say "next"
- Follow the exact Spec Kit sequence
- Let the user control pacing

**The workflow is:**
```
Claude: [Generates /specify prompt]
User: "next"
Claude: [Generates /plan prompt]
User: "next"
Claude: [Generates /tasks prompt]
User: "next"
Claude: [Generates /implement prompt]
User: "next"
Claude: [Generates comprehensive testing prompt]
User: "next" (after tests complete)
Claude: [Generates git commit command]
```

---

## 🔄 THE SPEC KIT WORKFLOW (4 STEPS)

### Overview

GitHub Spec Kit is a structured development framework that uses Claude Code to build features through sequential steps. Each command creates artifacts in the `specs/phase-X/` directory.

**The 4 Core Commands:**
1. `/specify` - Define what to build
2. `/plan` - Determine how to build it
3. `/tasks` - Break down into sequential tasks
4. `/implement` - Execute the build

### STEP 1: Generate `/specify` Prompt

**Claude's Role:**
1. Read relevant PRD files using `view` tool
2. Extract requirements for current phase
3. Generate specification prompt
4. Present to user for copy/paste

**Prompt Structure:**
```
/specify

[Feature name - first 3 words become Git branch name]

USER STORY:
As a [user type], I need to [action], so I can [benefit].

ACCEPTANCE CRITERIA:
1. I can [action 1]
2. I can [action 2]
[etc... 5-10 criteria]

KEY ENTITIES:
[Database tables and EXACT field names from PRD]

BUSINESS RULES:
[Validation, calculations, logic from 06-BUSINESS-RULES.md]

DESIGN REFERENCES:
[Colors, spacing, components from 02-DESIGN-SYSTEM.md]

DATABASE:
Tables already exist in Supabase (created in Phase 1).
DO NOT create tables. Use existing schema from 03-DATABASE-SCHEMA.md.

[List EXACT table names and field names]

ROUTING:
[URL paths]

FUTURE ENHANCEMENTS (not this phase):
[Features deferred to later phases]
```

**User Action:** Pastes into Claude Code  
**Output:** Claude Code generates `specs/phase-X/spec.md`

---

### STEP 2: Generate `/plan` Prompt

**Claude's Role:**
1. Read PRD design system (02-DESIGN-SYSTEM.md)
2. Read PRD database schema (03-DATABASE-SCHEMA.md)
3. Read PRD business rules (06-BUSINESS-RULES.md)
4. Generate comprehensive technical plan
5. Present to user for copy/paste

**⚠️ CRITICAL: This is where database field name issues happen!**

**Prompt Structure:**
```
/plan

TECHNICAL IMPLEMENTATION PLAN

Reference the generated spec.md and implement Phase X: [Feature Name] using the following technical specifications.

═══════════════════════════════════════════════════════════════════
DESIGN SYSTEM (from PRD 02-DESIGN-SYSTEM.md)
═══════════════════════════════════════════════════════════════════

**Colors:**
- Brand Primary: #D4A5A5 (dusty rose)
- Success: #4CAF50 (green)
- Warning: #FF9800 (orange)
- Error: #F44336 (red)
- Info: #2196F3 (blue)
[Full color palette]

**Typography:**
[Font sizes, weights, line heights]

**Spacing:**
[xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px]

**Component Styles:**
[Cards, buttons, forms, badges, etc.]

═══════════════════════════════════════════════════════════════════
⚠️ CRITICAL: EXACT DATABASE FIELD NAMES ⚠️
═══════════════════════════════════════════════════════════════════

**SOURCE:** 03-DATABASE-SCHEMA.md (lines XXX-YYY)

These are the ACTUAL Supabase database field names.
DO NOT change, guess, or modify these names.
DO NOT use camelCase in queries - database uses snake_case.

**[table_name] table:**

✅ CORRECT field names (use these EXACTLY):
- field_name_one (NOT fieldNameOne, NOT fieldname)
- field_name_two (NOT fieldNameTwo)
- foreign_key_id (NOT foreignKeyId)

❌ COMMON MISTAKES TO AVOID:
- business_name ← WRONG, doesn't exist
- companyName ← WRONG, no camelCase in database
- company_name ← CORRECT

**TypeScript Interface (for code):**
```typescript
/**
 * CRITICAL: Database uses snake_case
 * 
 * In Supabase queries, use: company_name, contact_name
 * In TypeScript code, can use: companyName, contactName
 * 
 * Mapping happens via Supabase client automatically.
 */
interface TableName {
  id: string;
  wedding_id: string;         // DB: wedding_id
  company_name: string;        // DB: company_name (NOT business_name!)
  contact_name: string;        // DB: contact_name
  // ... all fields with EXACT names from schema
}
```

**Supabase Query Examples (COPY EXACTLY):**
```typescript
// Fetch with joins
const { data } = await supabase
  .from('table_name')  // ⚠️ Exact table name
  .select(`
    *,
    related_table:related_table_name(id, field_name)
  `)
  .eq('wedding_id', weddingId)  // ⚠️ snake_case field name
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert({
    wedding_id: weddingId,      // snake_case
    company_name: companyName,  // snake_case
    contact_name: contactName   // snake_case
  })
  .select()
  .single();
```

⚠️ VERIFICATION BEFORE CODING:
- All field names match 03-DATABASE-SCHEMA.md exactly
- All queries use snake_case (company_name, NOT companyName)
- Foreign keys match: wedding_id, event_id, vendor_id
- Table names are correct (usually plural)
- GENERATED columns are NOT in INSERT statements

═══════════════════════════════════════════════════════════════════
BUSINESS RULES (from PRD 06-BUSINESS-RULES.md)
═══════════════════════════════════════════════════════════════════

**Rule RX.X: [Rule Name]**
```javascript
// Copy exact formula/logic from PRD
function ruleName() {
  // Implementation
}
```

[Include ALL relevant business rules for this phase]

═══════════════════════════════════════════════════════════════════
FILE STRUCTURE
═══════════════════════════════════════════════════════════════════

Follow established patterns:

```
src/
├── types/
│   └── [entity].types.ts          # TypeScript interfaces
├── schemas/
│   └── [entity].schema.ts         # Zod validation schemas
├── hooks/
│   ├── use[Entity].ts             # Fetch single
│   ├── use[Entities].ts           # Fetch list
│   └── use[Entity]Mutations.ts    # CRUD operations
├── components/
│   └── [entity]/
│       ├── [Entity]List.tsx       # List/grid component
│       ├── [Entity]Card.tsx       # Card component
│       ├── [Entity]Form.tsx       # Form component
│       ├── [Entity]Modal.tsx      # Add/edit modal
│       └── Delete[Entity]Dialog.tsx
└── pages/
    ├── [Entity]Page.tsx           # List page
    └── [Entity]DetailPage.tsx     # Detail page
```

═══════════════════════════════════════════════════════════════════
COMPONENT SPECIFICATIONS
═══════════════════════════════════════════════════════════════════

[Detailed specs for each component, including props, behavior, styling]

═══════════════════════════════════════════════════════════════════
CONSTITUTIONAL COMPLIANCE
═══════════════════════════════════════════════════════════════════

✅ No unit tests (only E2E with Playwright)
✅ Simple UX, clean code
✅ Minimal dependencies
✅ Follow established patterns
✅ Use Shadcn/ui components
✅ Tailwind CSS only (no custom CSS)
✅ TypeScript strict mode
✅ Zod for validation
✅ React Hook Form for forms
✅ Supabase for all data operations
```

**User Action:** Pastes into Claude Code  
**Output:** Claude Code generates `specs/phase-X/plan.md` + `research.md`

---

### STEP 3: Generate `/tasks` Prompt

**Claude's Role:**
- Generate simple `/tasks` command
- No additional context needed

**Prompt:**
```
/tasks
```

**User Action:** Pastes into Claude Code  
**Output:** Claude Code generates `specs/phase-X/tasks.md`

---

### STEP 4: Generate `/implement` Prompt

**Claude's Role:**
- Generate simple `/implement` command
- Suggest new chat session for clean context (optional)

**Prompt:**
```
/implement
```

**Optional Note:** "If your Claude Code chat is getting long, consider starting a new chat session before running /implement for clean context."

**User Action:** Pastes into Claude Code  
**Output:** Claude Code builds all files, components, pages

---

## 🧪 TESTING WORKFLOW (STEP 5)

After `/implement` completes, comprehensive testing MUST be done before git commit.

### Testing Philosophy

**DO test with Playwright (automated):**
- ✅ All functional behavior
- ✅ DOM structure and content
- ✅ Form validation
- ✅ Calculations and business rules
- ✅ Visual styling (via JavaScript inspection)
- ✅ Responsive behavior (resize viewport)
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Real-time updates
- ✅ Edge cases

**DON'T test manually:**
- ❌ Cross-browser (Safari, Firefox, Edge) - user doesn't care for now
- ❌ Anything Playwright can automate

### Test Coverage

**Basic Functional Tests:** 10 tests
- Navigation
- CRUD operations
- Empty states
- Form submission
- Data display

**Advanced PRD Alignment Tests:** 30+ tests
- Business rules validation (all rules from 06-BUSINESS-RULES.md)
- Real-time updates and recalculation
- Data integrity and relationships
- UI/UX edge cases
- Design system compliance
- Validation rules
- Accessibility

### Testing Prompt Structure

**Claude's Role:**
1. Read relevant business rules (06-BUSINESS-RULES.md)
2. Read design system (02-DESIGN-SYSTEM.md)
3. Read database schema (03-DATABASE-SCHEMA.md)
4. Generate comprehensive 40+ test prompt
5. Present to user for copy/paste

**Prompt Structure:**
```
GENERATE AND RUN COMPREHENSIVE PLAYWRIGHT E2E TESTS - PHASE X

═══════════════════════════════════════════════════════════════════
PHASE 1: SETUP
═══════════════════════════════════════════════════════════════════

1. Start dev server: `npm run dev`
2. Configure Playwright:
   - **headless: false** (VISIBLE BROWSER - user must see tests)
   - **slowMo: 500** (slow down for visibility)
   - **screenshots: 'on'** (capture on every action)
   - **video: 'on'** (record full session)
3. Login with test@example.com / password123
4. Navigate to test wedding → [Feature] page

═══════════════════════════════════════════════════════════════════
PHASE 2: TEST EXECUTION - BASIC FUNCTIONAL TESTS (10 Tests)
═══════════════════════════════════════════════════════════════════

**TEST 1: [Test Name]**

1. [Detailed step-by-step actions]
2. [Use JavaScript to inspect DOM when needed]
3. [Verify expected behavior]
4. Take screenshot

EXPECTED: [Clear expected outcome] ✅

---

[Repeat for all 10 basic tests]

═══════════════════════════════════════════════════════════════════
PHASE 3: ADVANCED PRD ALIGNMENT TESTS (30+ Tests)
═══════════════════════════════════════════════════════════════════

**BUSINESS RULES VALIDATION (X Tests)**

**TEST 11: Rule RX.X - [Rule Name]**

1. [Test setup]
2. [Execute business rule scenario]
3. [Verify calculation/validation]
4. Use JavaScript:
   ```js
   const result = document.querySelector('[data-testid="result"]')?.textContent;
   ```
5. Verify matches formula from 06-BUSINESS-RULES.md
6. Take screenshot

EXPECTED: [Expected calculation result] ✅

---

[Continue with all business rule tests]

**REAL-TIME UPDATES & RECALCULATION (X Tests)**
[Tests for reactive updates without page refresh]

**DATA & INTEGRATION (X Tests)**
[Tests for database operations, relationships, data integrity]

**UI & UX (X Tests)**
[Tests for edge cases, long text, large numbers, empty states]

**DESIGN SYSTEM (X Tests)**
[Tests verifying colors, spacing, styling match PRD]

**VALIDATION (X Tests)**
[Tests for form validation, error messages]

**ACCESSIBILITY (X Tests)**
[Tests for keyboard navigation, ARIA labels, screen readers]

═══════════════════════════════════════════════════════════════════
PHASE 4: AUTO-FIX LOOP (CRITICAL)
═══════════════════════════════════════════════════════════════════

**When ANY test fails:**

1. **STOP immediately** - do not continue to next test
2. **Analyze the failure:**
   - Read error message
   - Examine screenshot
   - Check console logs
   - Inspect DOM if needed
3. **Show user:**
   - Test number and name that failed
   - Error message
   - Screenshot path
   - Root cause diagnosis
4. **Fix the bug** in the code
5. **Re-run ONLY that specific test** (not entire suite)
6. **Repeat until test passes** (max 3 attempts per test)
7. **Then continue** to next test

**Only mark test as PASSED after successful re-test!**

═══════════════════════════════════════════════════════════════════
PHASE 5: FINAL TEST REPORT
═══════════════════════════════════════════════════════════════════

After ALL tests complete, generate this report:

```
# ✅ PHASE X [FEATURE NAME] - TESTING COMPLETE

## TEST RESULTS: X/40 PASSED

### BASIC FUNCTIONAL TESTS (10 Tests)
✅ Test 1: [Name]
✅ Test 2: [Name]
[... all tests listed]

### ADVANCED PRD ALIGNMENT TESTS (30 Tests)

**Business Rules Validation:**
✅ Test 11: Rule RX.X - [Name]
[... all rule tests]

**Real-Time Updates:**
[... all update tests]

**Data & Integration:**
[... all data tests]

**UI & UX:**
[... all UX tests]

**Design System:**
[... all design tests]

**Validation:**
[... all validation tests]

**Accessibility:**
[... all accessibility tests]

---

## 📸 SCREENSHOTS CAPTURED

[List all screenshot paths]

---

## 🐛 ISSUES FOUND (If Any)

[List any remaining issues, or note "None - all tests passed"]

---

## ✅ PRD ALIGNMENT VERIFIED

**Business Rules (06-BUSINESS-RULES.md):**
✅ RX.X [Rule Name] - [Verification]
[All rules verified]

**Database Schema (03-DATABASE-SCHEMA.md):**
✅ [Table] table with correct fields
✅ Foreign key relationships working
[All schema aspects verified]

**Design System (02-DESIGN-SYSTEM.md):**
✅ Brand colors: #D4A5A5, #4CAF50, etc.
✅ Component styling matches spec
[All design aspects verified]

**Features Requirements (04-FEATURES-REQUIREMENTS.md):**
✅ [Feature aspect 1]
✅ [Feature aspect 2]
[All feature requirements verified]

---

## ⏱️ TESTING SUMMARY

**Total Tests:** 40+
**Automated:** 40+ (100%)
**Manual Required:** 0 (cross-browser excluded per user request)
**Time Saved:** ~3 hours vs manual testing

---

## ✅ READY FOR GIT COMMIT

All tests passing ✅
PRD alignment verified ✅
Business rules validated ✅
Design system compliant ✅
Accessibility tested ✅

Ready to commit Phase X! 🎉
```

═══════════════════════════════════════════════════════════════════
END OF TESTING PROMPT
═══════════════════════════════════════════════════════════════════
```

**User Action:** Pastes into Claude Code, waits for all tests to pass  
**Output:** Test report showing X/40 passed

---

## 📝 GIT COMMIT WORKFLOW (STEP 6)

**CRITICAL: Only commit after ALL tests pass (X/40 = 100%)**

### Commit Command Structure

**Claude's Role:**
- Generate git commit command with comprehensive message
- Present to user for copy/paste

**Format:**
```bash
git add .
git commit -m "Phase X complete: [Feature Name]

FEATURES IMPLEMENTED:
✅ [Feature 1]
✅ [Feature 2]
✅ [Feature 3]

TESTING COMPLETED:
✅ 10 Basic functional tests - ALL PASSED
✅ 30+ Advanced PRD alignment tests - ALL PASSED
✅ Business rules validated (RX.X, RX.Y)
✅ Design system compliance verified
✅ Accessibility tested

DATABASE TABLES USED:
- [table_name]: [fields used]
- [related_table]: [fields used]

Phase Progress: X of 16 phases complete (Y%)"

git push origin main
```

**User Action:** 
1. Copies command
2. Pastes in terminal
3. Verifies push succeeds
4. Says "next" to update handover (if needed)

---

## 🔄 HANDOVER DOCUMENT UPDATES

### When to Update Handover

Update handover when:
- Approaching 170k tokens (20k remaining)
- Every 3-5 phases
- Significant new learnings discovered
- User requests update

### What to Include in Handover

**Updated Sections:**
1. **Completed Phases** - Add newly completed phases
2. **Current Status** - Update token usage, phase progress %
3. **New Backlog Items** - Any issues discovered
4. **Key Learnings** - New patterns or gotchas
5. **Technical Patterns** - Any new file/component patterns

**Handover Template:**
```markdown
# Vowsync Development - Complete Handover Document
**Last Updated:** Phase X Complete (Date)
**Context Tokens Used:** XXXk / 190k (XXk remaining)
**Phase Progress:** X of 16 phases complete (Y%)

## RECENT PROGRESS (Since Last Handover)

### âœ… Phase X: [Feature Name]
- [Bullet points of what was built]
- [Testing results]
- [Git commit hash]

[Repeat for all phases since last handover]

## CRITICAL LEARNINGS SINCE LAST HANDOVER

### Learning 1: [Title]
**Issue:** [What problem was discovered]
**Solution:** [How we fixed it]
**Prevention:** [How to avoid in future]

[Repeat for all learnings]

## UPDATED BACKLOG

[New items added since last handover]

## NEXT PHASE: Phase Y

[What's coming next]

---

**END OF HANDOVER**
```

---

## ⚠️ CRITICAL ISSUES & SOLUTIONS

### Issue 1: Claude Code Hallucinating Field Names

**Discovered:** Phase 9 (Bar Orders)  
**Severity:** CRITICAL 🚨

**Problem:**
Claude Code invented `business_name` field instead of using the specified `company_name` from the PRD. This causes silent bugs because queries return empty/null without errors.

**Root Cause:**
- `/plan` prompts not explicit enough about database schema
- Claude Code "guesses" what feels right instead of using exact names
- No verification step before coding

**Solution:**
Enhanced `/plan` prompt structure (see STEP 2 above) with:
- ⚠️ WARNING sections highlighting exact field names
- ❌ ✅ Examples showing wrong vs correct
- Database schema inline with line numbers from PRD
- Query templates to copy exactly
- Verification checklist before coding

**Prevention:**
- ALWAYS include the enhanced database schema section
- ALWAYS show wrong vs correct field name examples
- ALWAYS include query templates to copy
- VERIFY field names in generated plan.md before /tasks

### Issue 2: Token Limit Warnings Too Early

**Problem:**
Claude assistants warn about token limits prematurely (e.g., at 132k/190k when 58k remain).

**Solution:**
Only warn when <20k tokens remaining (170k+ used).

**Prevention:**
Instructions in this document specify when to warn about tokens.

### Issue 3: Skipping PRD Reading

**Problem:**
Some Claude instances skip reading PRD files and generate generic prompts.

**Solution:**
This document mandates reading PRDs FIRST before generating any prompts.

**Prevention:**
Start every response by reading relevant PRD sections with `view` tool.

### Issue 4: Generating Multiple Prompts at Once

**Problem:**
Some Claude instances generate `/specify`, `/plan`, `/tasks` all at once, overwhelming the user.

**Solution:**
Strict "one step at a time" rule documented here.

**Prevention:**
User says "next" after each step. Claude generates next prompt only.

---

## 📋 COMMAND CHECKLIST FOR CLAUDE

Before responding, verify:

- [ ] Have I read this VOWSYNC-DEVELOPMENT-PROCESS.md document?
- [ ] Have I read relevant PRD files for current phase?
- [ ] Am I generating ONLY ONE prompt per response?
- [ ] Am I waiting for user to say "next"?
- [ ] Does my `/plan` prompt include the enhanced database schema section?
- [ ] Have I verified field names match 03-DATABASE-SCHEMA.md exactly?
- [ ] Have I included business rules from 06-BUSINESS-RULES.md?
- [ ] Have I included design specs from 02-DESIGN-SYSTEM.md?
- [ ] Is my testing prompt comprehensive (40+ tests)?
- [ ] Am I only suggesting git commit after ALL tests pass?

---

## 🎯 SUMMARY: THE VOWSYNC WAY

1. **Read this document first** - Always
2. **Read PRD files** - Before every prompt generation
3. **One step at a time** - Wait for "next"
4. **Be explicit about database** - Use enhanced schema format
5. **Test comprehensively** - 40+ automated tests
6. **Commit only when perfect** - All tests must pass
7. **Update handover periodically** - Keep context fresh
8. **Learn from issues** - Update this document when new patterns emerge

---

## 📞 COMMUNICATION STYLE

**User Preferences (Funk):**
- Be direct, no fluff
- Don't apologize excessively
- Don't mention token limits unless critical (<20k)
- Show work through actions, not explanations
- Don't over-explain the process
- Generate the prompt, let user paste, move on

**What Funk Values:**
- Speed and efficiency
- Following the established process
- Comprehensive testing
- Accurate database schemas
- Clean, working code

---

## 🔮 FUTURE IMPROVEMENTS

As we learn more, add to this document:

**Potential Additions:**
- Common code patterns library
- Component reuse checklist  
- Performance optimization checklist
- Accessibility quick-reference
- Supabase query optimization guide

**This document evolves with the project.**

---

**END OF VOWSYNC DEVELOPMENT PROCESS GUIDE**

**Version History:**
- v1.0: Initial creation after Phase 7A
- v2.0: Enhanced after Phase 9 (database field name issue discovered)
