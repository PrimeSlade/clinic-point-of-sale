# Roadmap: Item History for Bulk Excel Imports

## Overview

This roadmap extends the existing single-item history tracking functionality to work with bulk Excel imports. The project is a **refactoring and extension task** rather than greenfield development—all required patterns, schemas, and functions already exist. The work focuses on adapting proven patterns from single-item edits to bulk operations while maintaining transactional integrity and performance.

**Milestone:** Item History Enhancement  
**Total Phases:** 3  
**Coverage:** 8/8 v1 requirements mapped ✓  
**Granularity:** Standard (5-8 phases target)  
**Risk Level:** Low (reusing existing patterns)

## Phases

- [ ] **Phase 1: Core History Integration** - Record change history for each updated item during bulk imports with full transactional consistency
- [ ] **Phase 2: Performance & Reliability** - Optimize for large imports through chunked processing and enhanced error handling
- [ ] **Phase 3: Observability & Verification** - Add comprehensive testing, logging, and validation to ensure production readiness

## Phase Details

### Phase 1: Core History Integration

**Goal:** Users importing Excel files see accurate change history for every updated item, with no history created for new items or unchanged items

**Dependencies:** None (first phase)

**Requirements:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8

**Success Criteria** (what must be TRUE):

1. User imports Excel file with mix of new and existing items → only existing items with changes generate history records
2. User views item history via GET `/api/v1/item-histories?itemId={id}` → sees import-sourced changes alongside manual edit changes, ordered by timestamp
3. History records show correct before/after values for changed unit fields with full decimal precision preserved
4. History records indicate action type as "import" (not "edit") and include authenticated user's ID and display name
5. Import fails midway (e.g., invalid location) → entire import rolls back with no orphaned history records or partial item updates in database

**Key Tasks:**

- Refactor `importItems` service to use `prisma.$transaction(callback)` pattern for interactive transactions
- Pre-fetch existing items within transaction to enable change comparison
- Integrate `markIsChangedUnit()` to detect which items actually changed
- Call `addItemHistory()` for each changed item before upsert operation
- Pass user context (ID and name) from controller → service → history function
- Add validation for maximum row count (5000 items) to prevent obvious performance issues
- Verify existing query endpoint (`getItemHistoriesById()`) correctly returns import history

**Plans:** 1 plan (6 waves)

Plans:
- [ ] 01-PLAN.md — Core history integration with transactional consistency

---

### Phase 2: Performance & Reliability

**Goal:** Users can import large Excel files (500-1000 items) within reasonable time (<60s) with clear feedback on success/failure

**Dependencies:** Phase 1 (requires working baseline to measure performance improvements)

**Requirements:** NFR-1 (Performance), NFR-2 (Reliability)

**Success Criteria** (what must be TRUE):

1. User imports 500 items → completes within 30 seconds with all history recorded correctly
2. User imports 1000 items → completes within 60 seconds with memory usage under 200MB
3. Import fails in middle of processing → error response indicates which items failed and how many succeeded/failed
4. System handles multiple concurrent imports from different users without deadlocks or data corruption
5. Configuration file allows adjustment of chunk size for different deployment environments (dev vs production)

**Key Tasks:**

- Implement chunked batch processing (process items in configurable batches of 100-200)
- Add environment-based configuration for chunk size (`IMPORT_CHUNK_SIZE` env var)
- Update database transaction timeout to 60s minimum for bulk operations
- Enhance error handling to track success/failure at chunk level
- Add import summary response: `{ created: N, updated: N, skipped: N, failed: N, errors: [...] }`
- Load test with 100, 500, 1000, and 5000 item datasets
- Profile memory usage and optimize if needed

**Plans:** TBD

---

### Phase 3: Observability & Verification

**Goal:** Team has confidence that bulk import history works correctly in production through comprehensive tests and monitoring

**Dependencies:** Phase 2 (needs performance-optimized baseline)

**Requirements:** NFR-3 (Maintainability) + Testing & Verification acceptance criteria

**Success Criteria** (what must be TRUE):

1. CI pipeline runs automated tests covering all import scenarios (new items, updates, no-ops, failures, concurrent imports)
2. Production logs show structured import metrics (rows processed, time per chunk, success/failure counts) for troubleshooting
3. Developer runs test suite locally → sees clear pass/fail for each scenario with detailed error messages
4. QA team follows test plan → validates all acceptance criteria in staging environment
5. Operations team receives alert when import fails → logs contain actionable debugging information (user, file size, error location)

**Key Tasks:**

- Write unit tests for change detection logic (`markIsChangedUnit` integration)
- Write integration tests for transaction + history creation scenarios:
  - Import with all new items (no history created)
  - Import with all existing items, all changed (history for all)
  - Import with all existing items, none changed (no history created)
  - Import with mix of new/existing/changed/unchanged items
  - Transaction rollback on error (no partial data)
  - Multiple imports by different users
- Add structured logging for import operations (start, chunk progress, completion, errors)
- Create test data fixtures for each scenario (10-50 items)
- Document testing strategy and manual QA checklist
- Consider adding performance monitoring integration (optional based on criticality)

**Plans:** TBD

---

## Progress Tracking

| Phase                           | Plans Complete | Status      | Completed |
| ------------------------------- | -------------- | ----------- | --------- |
| 1. Core History Integration     | 0/1            | Planned     | -         |
| 2. Performance & Reliability    | 0/?            | Not started | -         |
| 3. Observability & Verification | 0/?            | Not started | -         |

## Coverage Map

| Requirement | Phase   | Description                                                   |
| ----------- | ------- | ------------------------------------------------------------- |
| FR-1        | Phase 1 | Per-item change tracking using `markIsChangedUnit()`          |
| FR-2        | Phase 1 | Timestamp all changes via `ItemHistory.createdAt`             |
| FR-3        | Phase 1 | User attribution via `ItemHistory.userId` and `userName`      |
| FR-4        | Phase 1 | Before/after value capture in `ItemHistoryDetail`             |
| FR-5        | Phase 1 | Transactional consistency via `prisma.$transaction(callback)` |
| FR-6        | Phase 1 | Distinguish import from edit via `HistoryAction.import` enum  |
| FR-7        | Phase 1 | Query history by item via existing `getItemHistoriesById()`   |
| FR-8        | Phase 1 | Failed import rollback via transaction atomicity              |
| NFR-1       | Phase 2 | Performance targets (500 items <30s, <10% overhead)           |
| NFR-2       | Phase 2 | Reliability (chunk-level error handling)                      |
| NFR-3       | Phase 3 | Maintainability (testing, documentation, monitoring)          |

**Coverage:** 8/8 functional requirements mapped ✓  
**Non-Functional Requirements:** 3 NFRs distributed across Phases 2-3

## Dependencies

```
Phase 1 (Core History Integration)
  ↓
Phase 2 (Performance & Reliability)
  ↓
Phase 3 (Observability & Verification)
```

All phases are sequential because:

- Phase 2 requires Phase 1's working baseline to measure performance improvements
- Phase 3 requires Phase 2's optimized implementation to write meaningful tests
- No parallel work possible (all phases modify same import service)

## Key Decisions

| Decision                                           | Rationale                                                          | Phase      |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| Reuse `addItemHistory()` and `markIsChangedUnit()` | Proven functions, DRY principle, consistency with single-edit flow | Phase 1    |
| Interactive transaction pattern                    | All-or-nothing semantics, already used for single edits            | Phase 1    |
| Chunked batch processing                           | Prevents transaction timeouts, manageable memory for large imports | Phase 2    |
| Defer observability to Phase 3                     | Not critical for functionality, easier after patterns proven       | Phase 3    |
| No new dependencies                                | Existing stack sufficient (Prisma, PostgreSQL, ExcelJS)            | All phases |

## Out of Scope

Explicitly NOT included in this milestone:

- Import summary record (track "batch imported 50 items" as single record)
- Bulk rollback by import batch (undo entire import with one action)
- Pre-import conflict detection (show pending changes before import)
- Partial import with errors (continue importing valid rows, skip errors)
- Item-level rollback (revert individual imported items)
- Real-time import progress (show progress during upload)
- Excel client-side validation (frontend validation before upload)

## Success Metrics

### Phase 1 Complete When:

- ✅ Import with new items creates no history (correct behavior)
- ✅ Import with updated items creates history with correct before/after values
- ✅ Import with unchanged items creates no history (correct behavior)
- ✅ Failed import leaves no partial data or orphaned history
- ✅ History query returns import-sourced changes ordered by timestamp

### Phase 2 Complete When:

- ✅ 500-item import completes in <30 seconds
- ✅ 1000-item import completes in <60 seconds
- ✅ Memory usage stays under 200MB for large imports
- ✅ Failed imports report actionable error messages with counts

### Phase 3 Complete When:

- ✅ Test suite covers all import scenarios with >80% code coverage
- ✅ Production logs contain structured import metrics
- ✅ Team has confidence deploying to production
- ✅ Documentation exists for testing and troubleshooting

---

_Created: 2026-03-19_  
_Next: `/gsd-plan-phase 1` to break down Core History Integration phase_
