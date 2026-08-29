# Feature Landscape: Item History Tracking for Bulk Excel Imports

**Domain:** Point-of-Sale / Inventory Management - Bulk Import History
**Researched:** March 19, 2025
**Context:** Adding history tracking to existing bulk Excel import functionality

## Current State Analysis

### Existing Infrastructure
The system already has:
- ✅ Single item history tracking via `addItemHistory()` (edit action only)
- ✅ Excel import/export with ExcelJS
- ✅ Change detection for single items via `markIsChangedUnit()`
- ✅ Prisma transaction support (`prisma.$transaction`)
- ✅ Upsert logic in `importItems()` (creates new, updates existing by barcode)
- ✅ History data model: `ItemHistory` (header) + `ItemHistoryDetail` (per-unit changes)
- ✅ `HistoryAction` enum with 'edit' and 'import' values

### Current Gap
Bulk imports (`importItem` service) **do NOT** call `addItemHistory()`, so:
- No audit trail for bulk changes
- No rollback capability for failed imports
- No visibility into what changed during import
- Cannot track who made bulk changes (user context missing)

## Table Stakes Features

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Per-item change tracking** | Must know what changed for each item in import | Medium | Requires comparing old vs new values before upsert |
| **Timestamp all changes** | Essential for audit compliance | Low | Already in schema (`ItemHistory.createdAt`) |
| **User attribution** | Need accountability for bulk changes | Low | `ItemHistory.userId` + `userName` already exist |
| **Before/after value capture** | Cannot rollback without old values | Medium | `ItemHistoryDetail` schema already supports this |
| **Transactional consistency** | Import + history must succeed/fail together | Low | Existing `$transaction` pattern can be reused |
| **Distinguish import from edit** | Different workflows need different treatment | Low | `HistoryAction.import` already exists in enum |
| **Query history by item** | Users need to see item's change timeline | Low | `getItemHistoriesById` already implemented |
| **Failed import rollback** | Partial imports should not leave corrupt data | Medium | Requires transaction wrapping entire import |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Import summary record** | Single record showing "50 items imported by User X" | Medium | New pattern: parent `ItemHistory` with no details, or batch ID field |
| **Bulk rollback by import batch** | Undo entire import with one action | High | Requires batch tracking + inverse operations |
| **Pre-import conflict detection** | Show pending changes before import overwrites them | Medium | Detect if item has unsaved/recent changes |
| **Import impact analysis** | Preview: "10 new items, 5 updates, 2 conflicts" | Medium | Dry-run mode that doesn't commit |
| **Change-only history** | Track only items that actually changed, not all items | Low | Filter out no-op updates (same values) |
| **Partial import with errors** | Continue importing valid rows, log errors | High | Complex error handling + partial transaction semantics |
| **Excel validation preview** | Client-side validation before upload | Medium | Requires duplicating validation logic to frontend |

## Anti-Features

Features to explicitly NOT build (for this milestone).

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Item-level rollback** | Overly complex for bulk operations; use batch rollback | Provide "undo import" that reverts entire batch |
| **Real-time import progress** | Excel import is fast (<10k items < 3s); not worth WebSocket overhead | Return batch result after completion |
| **Version control / branching** | Not needed for inventory management; adds massive complexity | Simple linear history with timestamps |
| **Manual conflict resolution UI** | Import is automated; conflicts should fail fast | Clear error messages, require fixed Excel re-upload |
| **Incremental imports with resumption** | Excel files are small; retry is faster than resume logic | All-or-nothing transaction |

## Change Detection Strategy

### Recommended Approach: Pre-Fetch + Compare

**Pattern:**
```typescript
// For each row in Excel:
1. Check if item exists (by barcode)
2. If exists:
   a. Fetch current values
   b. Compare new vs old (per unit field)
   c. Mark changed fields
   d. Only create history if changes detected
3. If new:
   a. Create history with action='import', oldValue=NULL
```

**Complexity:** Medium
**Why:** Reuses existing `markIsChangedUnit()` pattern, minimal new code

**Alternative (Not Recommended):** Database triggers
- **Pros:** Automatic, no application logic needed
- **Cons:** Can't capture username, harder to debug, Prisma doesn't generate trigger code

## History Granularity Recommendation

### Strategy: Hybrid (Per-Item Details + Batch Summary)

**Approach:**
1. **Create one `ItemHistory` record per changed item**
   - `action = 'import'`
   - `userName`, `userId` from import request
   - Associated `ItemHistoryDetail` records for changed units

2. **Add batch metadata** (minor schema change)
   - Add `batchId: String?` to `ItemHistory`
   - Generate UUID for each import operation
   - All histories in same import share `batchId`

**Why this works:**
- Reuses existing history structure (low effort)
- Enables "show all changes from Import X" queries
- Supports per-item history view (existing `getItemHistoriesById`)
- Enables batch rollback (future feature)

**Complexity:** Medium
**Effort:** ~1 schema migration, 2 hours implementation

### Alternative Considered: Single Import Summary Record
- **Pros:** Less DB rows, simpler model
- **Cons:** Can't query "show me item X's history across imports", breaks existing API

## Rollback Behavior

### Recommendation: All-or-Nothing Transaction

**Strategy:**
```typescript
prisma.$transaction(async (trx) => {
  for (const item of validatedItems) {
    // 1. Fetch old values (if exists)
    // 2. Create ItemHistory record(s)
    // 3. Upsert item
  }
  // If ANY step fails, entire import rolls back
})
```

**Why:**
- Prisma transactions auto-rollback on error
- Prevents partial history + partial data inconsistency
- Already used pattern (see `updateItem`, `createInvoice`)

**Complexity:** Low (already architected this way)

### What About Partial History?
**Decision:** Rollback partial history
**Reason:** History without corresponding data changes is misleading and breaks audit trail

### Timeout Handling
**Risk:** Large imports (1000+ rows) may exceed transaction timeout (default 5s in PostgreSQL)
**Mitigation:**
1. Set explicit timeout: `prisma.$transaction(fn, { timeout: 30000 })` 
2. Batch imports: Process 500 rows/transaction, multiple transactions
3. **Recommended:** Keep simple for MVP (single transaction), optimize if needed

**Complexity:** Low (timeout config) to Medium (batching)

## Conflict Resolution

### Problem: Import Overwrites Pending Changes

**Scenario:**
1. User A edits Item #123 via UI (not yet saved)
2. User B uploads Excel with Item #123
3. Import succeeds, overwrites User A's pending changes

**Industry Pattern:** Last-write-wins with detection warning

### Recommended Strategy: Timestamp-Based Detection (Future)

For **this milestone:** Keep existing behavior (import always wins)

**Rationale:**
- Excel export includes hidden `_UnitID` columns, so imports are typically based on recent exports
- Conflict scenario is rare (requires simultaneous edit + import of same item)
- Detection requires additional "last modified" tracking (not in current schema)

**Future Enhancement:**
1. Add `ItemUnit.updatedAt` field
2. Before import, check if `updatedAt > (export_time || 5 minutes ago)`
3. If conflict: Add to error report, skip item or fail import (configurable)

**Complexity (future):** Medium
**Complexity (this milestone):** N/A (skip)

## Reporting Features

### Must-Have Views

| View | Purpose | Query Pattern | Complexity |
|------|---------|---------------|------------|
| **Item history timeline** | Show all changes to specific item | `getItemHistoriesById(itemId)` | ✅ Already exists |
| **Recent imports list** | "Show last 10 imports" | `ItemHistory WHERE action='import' GROUP BY batchId ORDER BY createdAt DESC` | Low |
| **Import details** | "Show all items changed in Import X" | `ItemHistory WHERE batchId='xxx' INCLUDE itemHistoryDetails` | Low |
| **User audit log** | "Show all imports by User Y" | `ItemHistory WHERE userId='yyy' AND action='import'` | Low |

### Nice-to-Have Views (Defer)

| View | Purpose | Why Defer | Complexity |
|------|---------|-----------|------------|
| **Diff viewer** | Side-by-side old vs new values | UI-heavy, low business value for bulk imports | High |
| **Rollback preview** | "Undoing this will affect 50 items" | Requires rollback feature first | Medium |
| **Import analytics** | "Average import size", "most changed items" | Nice-to-have, not critical for audit compliance | Medium |

## MVP Feature Set (Prioritized)

### Phase 1: Core History Tracking
**Goal:** Match single-item edit behavior for imports

1. ✅ Modify `importItems()` to accept `UserInfo` parameter
2. ✅ Before upsert, fetch existing items (if barcodes match)
3. ✅ Compare old vs new values using `markIsChangedUnit()` pattern
4. ✅ Create `ItemHistory` records only for changed items
5. ✅ Wrap import + history in single transaction
6. ✅ Set `action='import'` to distinguish from edits

**Acceptance Criteria:**
- Import with no changes = no history records created
- Import with 10 changed items = 10 `ItemHistory` records created
- Transaction rollback on any error (history + data)
- User attribution captured from request context

**Effort:** 6-8 hours
**Complexity:** Medium

### Phase 2: Batch Tracking (Optional)
**Goal:** Group related histories by import operation

1. Generate `batchId` (UUID) for each import
2. Add `batchId: String?` to `ItemHistory` schema
3. Populate `batchId` in all histories from same import
4. Create API endpoint: `GET /items/import-history?batchId=xxx`

**Acceptance Criteria:**
- Single import operation = all histories share same `batchId`
- Can query all items changed in specific import

**Effort:** 3-4 hours
**Complexity:** Low

### Deferred Features
- ❌ Batch rollback (complex inverse operations)
- ❌ Conflict detection (requires schema changes)
- ❌ Import impact analysis (requires dry-run mode)
- ❌ Partial import on error (changes import semantics)

## Feature Dependencies

```
┌─────────────────────────────────┐
│ Existing: Transaction Pattern   │ (DONE)
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ Existing: History Data Model    │ (DONE)
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ Phase 1: Import History Tracking│ (THIS MILESTONE)
└───────────────┬─────────────────┘
                │
                ├──────────────────────────────┐
                ▼                              ▼
┌─────────────────────────────────┐   ┌──────────────────────────┐
│ Phase 2: Batch Tracking          │   │ Future: Conflict Detection│
│ (Optional Enhancement)           │   │ (Requires updatedAt field)│
└───────────────┬─────────────────┘   └──────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ Future: Batch Rollback           │
│ (Requires inverse operations)    │
└─────────────────────────────────┘
```

**Critical Path:** Phase 1 only (6-8 hours)
**Optional:** Phase 2 if time permits (3-4 hours)

## Implementation Notes

### Key Code Locations
- **Service Logic:** `src/services/item.service.ts::importItem()`
- **Model Logic:** `src/models/item.model.ts::importItems()` and `addItemHistory()`
- **Utilities:** `src/utils/item.util.ts::markIsChangedUnit()` (reusable)
- **Schema:** `prisma/schema.prisma::ItemHistory`, `ItemHistoryDetail`

### Integration Points
1. **Controller:** Modify `item.controller.ts::importItem()` to pass `req.user`
2. **Service:** Add user context to `importItem(buffer, user)`
3. **Model:** Refactor `importItems()` to accept transaction client
4. **Transaction:** Wrap import + history creation in `prisma.$transaction()`

### Error Handling Pattern
```typescript
try {
  await prisma.$transaction(async (trx) => {
    // All import + history operations
  }, { timeout: 30000 });
} catch (error) {
  // Transaction auto-rolled back
  if (error instanceof NotFoundError) {
    throw new BadRequestError(`Import failed: ${error.message}`);
  }
  handlePrismaError(error);
}
```

### Testing Strategy
1. **Unit Tests:**
   - `markIsChangedUnit()` correctly identifies changes
   - `addItemHistory()` creates correct records with `action='import'`

2. **Integration Tests:**
   - Import with all new items → creates history with `oldValue=NULL`
   - Import with existing items → compares and logs only changes
   - Import with no changes → creates no history records
   - Import with error midway → rolls back history + data

3. **E2E Tests:**
   - Upload Excel → verify history appears in `GET /items/:id/history`
   - Import as User A → verify `userName` and `userId` captured

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Performance degradation** (fetch before upsert) | Medium | Medium | Batch fetch items by barcode array, single query |
| **Transaction timeout** (large imports) | Low | High | Set explicit 30s timeout, add monitoring |
| **History table growth** | High | Low | Standard: Add index on `itemId`, `createdAt`; Advanced: Archive old history |
| **Incomplete history** (missing user context) | Low | Medium | Validate `req.user` exists before import starts |
| **Duplicate history** (retry logic) | Low | Low | Imports are idempotent (upsert), history de-duped by timestamp |

## Open Questions

1. **Should empty Excel imports (no data rows) create history records?**
   - **Recommendation:** No, validateFile() already throws error for empty files

2. **How long to retain import history?**
   - **Recommendation:** Indefinitely for MVP, add archival policy later (e.g., 2 years)

3. **Should history track item deletions during import?**
   - **Recommendation:** No, current import only creates/updates, doesn't delete

4. **What if user is missing from request context (API token, cron job)?**
   - **Recommendation:** Fail fast with 401 Unauthorized, or use system user ID

## Sources & Confidence

**Confidence Level:** HIGH

**Primary Sources:**
- ✅ Codebase analysis (actual implementation patterns)
- ✅ Database schema (`prisma/schema.prisma`)
- ✅ Existing single-item history implementation (`addItemHistory`)
- ✅ Transaction patterns in `item.service.ts`, `invoice.service.ts`

**Industry Patterns (MEDIUM confidence):**
- Audit trail best practices: Timestamp, user, before/after values (standard)
- Transactional consistency for bulk operations (PostgreSQL best practice)
- Batch tracking via UUID (common in ETL systems)

**Low Confidence / Needs Validation:**
- ⚠️ Specific POS system import patterns (no external research due to tool limitations)
- ⚠️ Exact performance impact of pre-fetch (depends on dataset size)
  - **Mitigation:** Test with realistic dataset (500-1000 items)

## Success Metrics

**Implementation Complete When:**
- ✅ All imports create `ItemHistory` records for changed items
- ✅ User attribution captured from `req.user`
- ✅ Transaction rollback tested (history + data consistency)
- ✅ Existing `getItemHistoriesById` API returns import history
- ✅ No performance regression on imports <1000 items
- ✅ Integration tests cover happy path + rollback scenarios

**Quality Gates:**
- ✅ Zero history records created for no-change imports
- ✅ History details match actual field changes (not all fields)
- ✅ Action field = 'import' (distinct from 'edit')
