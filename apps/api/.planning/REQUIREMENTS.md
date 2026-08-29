# Requirements: Item History for Bulk Excel Imports

**Version:** 1.0  
**Milestone:** Item History Enhancement  
**Scope:** MVP (Table Stakes Only)  
**Last Updated:** 2026-03-19 after research

## Overview

Add comprehensive change history tracking to bulk Excel imports, extending the existing single-item history functionality (`addItemHistory`) to work with bulk operations. The system must record what changed, when, who made the change, and what the before/after values were—all while maintaining data consistency through atomic transactions.

## Business Value

- **Audit Trail:** Complete record of all inventory changes via bulk import
- **Accountability:** Identify who imported which changes when
- **Recoverability:** Ability to see exact before/after state of any imported item
- **Regulatory Compliance:** Support for auditing and compliance reporting

## Scope: Table Stakes Requirements

These are table stakes features. Missing any of these = incomplete implementation.

### FR-1: Per-Item Change Tracking

**Phase:** 1 - Core History Integration  
**What:** Record changes for each item in the import that was actually modified.

**Acceptance Criteria:**

- [ ] System detects which items were created (new barcode) vs updated (existing barcode)
- [ ] System compares existing item values with import values (using existing `markIsChangedUnit()`)
- [ ] Only items with actual changes create history records (no-op updates skipped)
- [ ] History is recorded for unit/quantity changes only (other fields out of scope)

**Implementation Guidance:**

- Reuse existing `markIsChangedUnit()` function to detect changes
- Use existing `addItemHistory()` for history recording
- Pre-fetch existing items within transaction for comparison

### FR-2: Timestamp All Changes

**Phase:** 1 - Core History Integration  
**What:** Each history record captures the exact time the change occurred.

**Acceptance Criteria:**

- [ ] `ItemHistory.createdAt` is set to current time when record created
- [ ] Timestamp is set server-side (not client)
- [ ] Timestamp reflects import transaction time (not individual item time)

**Implementation Guidance:**

- Existing schema already supports this (`createdAt` field)
- No action needed; Prisma handles with `@default(now())`

### FR-3: User Attribution

**Phase:** 1 - Core History Integration  
**What:** Each history record identifies the user who performed the import.

**Acceptance Criteria:**

- [ ] `ItemHistory.userId` is set to authenticated user
- [ ] `ItemHistory.userName` captures user's display name at time of change
- [ ] User context is passed from controller → service → model

**Implementation Guidance:**

- Extract from `req.user` in controller
- Pass through service to model
- Add as parameter to `addItemHistory()` call

### FR-4: Before/After Value Capture

**Phase:** 1 - Core History Integration  
**What:** History records the exact values before and after the import for each changed field.

**Acceptance Criteria:**

- [ ] `ItemHistoryDetail.oldValue` contains the previous value (from database)
- [ ] `ItemHistoryDetail.newValue` contains the imported value
- [ ] Both values are captured for all changed unit fields
- [ ] Values include decimal precision (no rounding)

**Implementation Guidance:**

- Fetch existing item before upsert to capture `oldValue`
- Existing `ItemHistoryDetail` schema already supports this
- Use Prisma `Decimal` type to preserve precision

### FR-5: Transactional Consistency

**Phase:** 1 - Core History Integration  
**What:** Import and all history records succeed or fail together.

**Acceptance Criteria:**

- [ ] Import data, upserts, and history recording all wrapped in single `prisma.$transaction()`
- [ ] If any step fails, entire import is rolled back (no orphaned history, no partial imports)
- [ ] Transactional failure returns clear error message to client

**Implementation Guidance:**

- Refactor from `prisma.$transaction(array)` to `prisma.$transaction(callback)` pattern
- Existing pattern already used in single-item edits
- Ensures all-or-nothing semantics

### FR-6: Distinguish Import from Edit

**Phase:** 1 - Core History Integration  
**What:** History records indicate the change came from "import" action, not manual edit.

**Acceptance Criteria:**

- [ ] `ItemHistory.action` is set to `"import"` (from existing `HistoryAction` enum)
- [ ] Admin can filter history by action type (import vs edit)
- [ ] Reporting can distinguish bulk changes from manual changes

**Implementation Guidance:**

- `HistoryAction.import` already exists in enum
- Pass as parameter to `addItemHistory()`
- No schema changes needed

### FR-7: Query History by Item

**Phase:** 1 - Core History Integration  
**What:** Users can retrieve the complete change history for any item.

**Acceptance Criteria:**

- [ ] GET `/api/v1/item-histories?itemId={id}` returns all changes for item
- [ ] Results include import changes alongside manual edit changes
- [ ] Results are ordered by timestamp (newest first)
- [ ] Results include user, timestamp, action type, before/after values

**Implementation Guidance:**

- Existing `getItemHistoriesById()` function already exists
- Reuse this function; no changes needed
- Already filters and orders correctly

### FR-8: Failed Import Rollback

**Phase:** 1 - Core History Integration  
**What:** If the import fails partway through, no corrupt or partial data is left behind.

**Acceptance Criteria:**

- [ ] Entire import transaction fails if any step fails
- [ ] No history records created for items that weren't fully upserted
- [ ] No partial item updates (missing history)
- [ ] Database returns to pre-import state on failure

**Implementation Guidance:**

- Enforced by `prisma.$transaction(callback)` pattern
- Transaction commits atomically or rolls back entirely
- No additional code needed beyond refactoring

## Out of Scope (Explicit Boundaries)

These features are NOT included in MVP scope:

- **Import summary record** — Track "batch 1 imported 50 items" as single record. Defer to Phase 2.
- **Bulk rollback by import batch** — Undo entire import with one action. Requires additional schema. Defer to Phase 2.
- **Pre-import conflict detection** — Show pending changes before import. Defer to Phase 2.
- **Partial import with errors** — Continue importing valid rows, skip errors. Out of scope; use atomic all-or-nothing.
- **Item-level rollback** — Revert individual imported items. Use "undo import" for entire batch instead.
- **Real-time import progress** — Show progress during upload. Not needed for small imports (<10k items ~3s).
- **Excel client-side validation** — Frontend validation before upload. Server-side validation sufficient.

## Non-Functional Requirements

### NFR-1: Performance

**Phase:** 2 - Performance & Reliability

- [ ] Import up to 500 items within 5 seconds
- [ ] History recording adds <10% overhead to import time
- [ ] No memory exhaustion for typical file sizes (up to 5000 rows)

### NFR-2: Reliability

**Phase:** 2 - Performance & Reliability

- [ ] All imports are atomic (all-or-nothing)
- [ ] Transaction timeout set appropriately (30s minimum for large imports)
- [ ] Clear error messages when import fails

### NFR-3: Maintainability

**Phase:** 3 - Observability & Verification

- [ ] Reuse existing `addItemHistory()` function (DRY principle)
- [ ] Reuse existing `markIsChangedUnit()` for change detection
- [ ] Follow existing controller → service → model layering
- [ ] No schema changes required

## Constraints

- **Must reuse existing functions** - `addItemHistory()` and `markIsChangedUnit()` already proven
- **Must maintain transactional semantics** - All-or-nothing, no partial imports
- **Must use existing schema** - No new tables or columns needed
- **Must integrate with existing auth/ABAC** - Use current user context from middleware
- **Must work within Express/Prisma patterns** - No new frameworks or libraries

## Acceptance Criteria (Complete)

### Core Functionality

- [x] Research complete (stack, architecture, pitfalls identified)
- [ ] FR-1 Per-item change tracking (Phase 1)
- [ ] FR-2 Timestamp all changes (Phase 1)
- [ ] FR-3 User attribution (Phase 1)
- [ ] FR-4 Before/after value capture (Phase 1)
- [ ] FR-5 Transactional consistency (Phase 1)
- [ ] FR-6 Distinguish import from edit (Phase 1)
- [ ] FR-7 Query history by item (Phase 1)
- [ ] FR-8 Failed import rollback (Phase 1)

### NFR

- [ ] NFR-1 Performance targets met (500 items in <5s, <10% overhead) (Phase 2)
- [ ] NFR-2 Reliable error handling and transaction rollback (Phase 2)
- [ ] NFR-3 Clean code following existing patterns (Phase 3)

### Testing & Verification

- [ ] Import with new items (no history created, correct) (Phase 3)
- [ ] Import with existing items, values changed (history created, correct) (Phase 3)
- [ ] Import with existing items, values unchanged (no history created, correct) (Phase 3)
- [ ] Transaction rollback on error (no partial data) (Phase 3)
- [ ] History query returns import-sourced changes (Phase 3)
- [ ] Multiple imports by different users tracked correctly (Phase 3)
- [ ] Performance within targets (Phase 3)

## Related Work

**Existing Implementations to Reuse:**

- `src/models/item.model.ts` - `addItemHistory()` function
- `src/utils/item-utils.ts` - `markIsChangedUnit()` function
- `src/services/item.service.ts` - Transaction patterns from single-item edit
- `src/controllers/item.controller.ts` - Request handling patterns

**Database Schema (No Changes Needed):**

- `ItemHistory` table - Already supports `action: "import"`
- `ItemHistoryDetail` table - Already captures before/after values

---

## Traceability

| Requirement                        | Phase   | Status  |
| ---------------------------------- | ------- | ------- |
| FR-1: Per-Item Change Tracking     | Phase 1 | Pending |
| FR-2: Timestamp All Changes        | Phase 1 | Pending |
| FR-3: User Attribution             | Phase 1 | Pending |
| FR-4: Before/After Value Capture   | Phase 1 | Pending |
| FR-5: Transactional Consistency    | Phase 1 | Pending |
| FR-6: Distinguish Import from Edit | Phase 1 | Pending |
| FR-7: Query History by Item        | Phase 1 | Pending |
| FR-8: Failed Import Rollback       | Phase 1 | Pending |
| NFR-1: Performance                 | Phase 2 | Pending |
| NFR-2: Reliability                 | Phase 2 | Pending |
| NFR-3: Maintainability             | Phase 3 | Pending |

**Coverage:** 11/11 requirements mapped (8 FRs + 3 NFRs) ✓

---

_Last updated: 2026-03-19 after research phase_
