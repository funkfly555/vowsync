# Research: Dashboard Bug Fixes

**Feature**: 023-dashboard-bug-fixes
**Date**: 2026-01-19
**Status**: Complete - All unknowns resolved

## Bug Investigation Findings

### BUG 1: Vendors Page TypeError

**Investigation Method**: Code analysis of VendorCard.tsx and ContractStatusBadge.tsx

**Findings**:

1. **Error Location**: `src/components/vendors/ContractStatusBadge.tsx:19`
   ```tsx
   const config = CONTRACT_STATUS_CONFIG[status.label];
   ```

2. **Data Flow**:
   - `VendorCard.tsx` receives `vendor: VendorDisplay` prop
   - `VendorDisplay` has `contractStatus: ContractStatusBadge` property
   - `ContractStatusBadge` expects `{ label: ContractStatusLabel, color: string }`
   - If `vendor.contractStatus` is undefined, accessing `.label` throws TypeError

3. **Root Cause**: The `toVendorDisplay()` function in `vendor.ts:258-265` should always calculate `contractStatus`, but if a raw vendor object bypasses this transformation, `contractStatus` will be undefined.

4. **Decision**: Add defensive null check in `ContractStatusBadge.tsx`
   - **Rationale**: Defense-in-depth - component should handle edge cases gracefully
   - **Alternatives Considered**: Fix upstream data transformation - rejected because component should be resilient regardless

### BUG 2: Event Timeline Horizontal Scroll

**Investigation Method**: CSS analysis and viewport calculations

**Findings**:

1. **Current Styling** (`EventTimelineCard.tsx:44-50`):
   ```tsx
   className="min-w-[280px] max-w-[320px] rounded-lg p-4"
   ```

2. **Container** (`EventTimelineCard.tsx:153-168`):
   ```tsx
   className="flex gap-4 overflow-x-auto"
   ```

3. **Viewport Calculations**:
   | Viewport | Available Width | Cards That Fit (min-w) | Cards That Fit (max-w) |
   |----------|-----------------|------------------------|------------------------|
   | 1920px   | ~1872px         | 6 cards                | 5 cards                |
   | 1440px   | ~1392px         | 4 cards                | 4 cards                |
   | 1366px   | ~1318px         | 4 cards                | 3-4 cards              |

4. **Problem**: With gap-4 (16px) and container p-6 (24px each side), the available content width is reduced. Current max-w-[320px] allows cards to expand, causing overflow.

5. **Decision**: Reduce card widths to `min-w-[200px] max-w-[260px]` and gap to `gap-3` (12px)
   - **Rationale**: Aligns with design system compact spacing (16px → md)
   - **New Calculations**: 5 cards × 260px + 4 × 12px + 48px = 1396px (fits 1440px)
   - **Alternatives Considered**:
     - Make cards fully responsive with flex-basis - rejected as more complex
     - Use CSS grid - rejected to preserve horizontal scroll behavior

### BUG 3: Budget Pie Chart Legend Overlap

**Investigation Method**: Component analysis and Recharts documentation review

**Findings**:

1. **Current Legend Renderer** (`BudgetPieChart.tsx:47-73`):
   ```tsx
   <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
   ```

2. **Problem**: `flex-wrap` with `justify-center` causes items to bunch together when many categories exist. The `gap-x-4` (16px) is insufficient for longer category names.

3. **Recharts Legend Behavior**: Default legend calculates layout automatically but can be overridden with custom `content` prop (already being used).

4. **Decision**: Change legend to 2-column grid layout
   - **Rationale**: Grid provides predictable column widths and prevents overlap
   - **Implementation**:
     ```tsx
     <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-4">
     ```
   - **Alternatives Considered**:
     - Scrollable legend container - rejected as hides information
     - Smaller font size only - rejected as insufficient for 15+ categories
     - Tooltip-only legend - rejected as reduces at-a-glance readability

## Design System Compliance

### Spacing Updates

Per constitution section II (Design System):

| Component | Current | Updated | Design System Reference |
|-----------|---------|---------|------------------------|
| Event card padding | p-4 (16px) | p-4 (16px) | No change - already correct |
| Event card min-width | 280px | 200px | Custom (responsive needs) |
| Event card max-width | 320px | 260px | Custom (responsive needs) |
| Timeline gap | gap-4 (16px) | gap-3 (12px) | Between sm(8px) and md(16px) |
| Legend layout | flex-wrap | grid cols-2 | Structured for readability |

### Color Usage

No color changes required - existing colors comply with design system:
- Event colors: Already using `getEventColor()` from utils
- Badge colors: Using `CONTRACT_STATUS_CONFIG` colors (green/yellow/orange/red)
- Chart colors: Using `CHART_COLORS` constant

## Technology Decisions

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Null handling approach | Defensive checks | Defense-in-depth, graceful degradation |
| Legend layout | CSS Grid | Predictable columns, no JS calculations |
| Card sizing | Fixed min/max widths | Simple, predictable, easy to maintain |
| Scrollbar behavior | Container-only scroll | Prevents page-level horizontal scroll |

## No Further Research Needed

All technical unknowns have been resolved through code analysis. No external documentation or API research required since:
- All fixes use existing Tailwind CSS utilities
- No new dependencies needed
- No database schema changes
- No new API endpoints
