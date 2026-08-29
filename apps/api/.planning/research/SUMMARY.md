# Research Summary: Bulk Excel Import History Tracking

**Domain:** Point-of-Sale Backend - Inventory Management
**Feature:** Add history tracking to bulk Excel imports
**Researched:** March 19, 2025
**Overall confidence:** HIGH

## Executive Summary

Research focused on the technical requirements for adding comprehensive change history tracking to the existing bulk Excel import feature. The analysis reveals that **the current stack is well-equipped** to handle this enhancement with minimal additions. The existing codebase already implements the necessary patterns (interactive transactions, change detection, history tables) for single-item edits; the primary work involves adapting these patterns to work with bulk import operations.

**Key Finding:** This is primarily a **refactoring and extension task** rather than a greenfield implementation. The schema already has optimal history tracking tables (`ItemHistory` and `ItemHistoryDetail`), and the transaction patterns are proven. The main technical challenges are:

1. **Performance optimization** - Implementing chunked batch processing to handle large imports (500+ items)
2. **Change detection at scale** - Fetching existing items for comparison within the import transaction
3. **Atomicity vs. performance tradeoffs** - Balancing transaction size with reliability

No new dependencies are required for the core functionality. Optional libraries (`decimal.js-light` for price calculations, `p-limit` for parallel processing) should only be added if performance testing reveals specific needs.

## Key Findings

**Stack:** Existing stack (Prisma 6.18, PostgreSQL 16.3, ExcelJS 4.4, TypeScript 5.8) is sufficient. No mandatory additions required.

**Architecture:** Extend existing interactive transaction pattern from single-edit operations to bulk imports. Use chunked batch processing for large files (100-200 items per transaction).

**Critical pitfall:** Transaction timeouts and memory issues with large imports. Mitigate with configurable chunk sizes, row limits (max 5000), and proper transaction timeout configuration.

## Implications for Roadmap

Based on research, suggested phase structure for this milestone:

### Phase 1: Core History Tracking (MVP)
**Duration:** 2-3 days
**Rationale:** Establish foundation without performance optimizations

**Tasks:**
1. Extract history creation into reusable helper function
2. Implement change detection for bulk imports (detect existing items, compare fields)
3. Refactor `importItems` to use interactive transaction pattern
4. Add history recording before upserts (for items with changes)
5. Add row count validation (max 5000 rows)

**Why this order:**
- Reusable helper ensures consistency with existing edit history
- Change detection needed before history can be recorded
- Interactive transaction provides atomicity for history + upsert
- Row limit prevents obvious performance issues

**Testing focus:**
- Verify history recorded for updated items (not new creations)
- Verify history details capture old/new values correctly
- Test import with mix of new and existing items

### Phase 2: Performance Optimization
**Duration:** 1-2 days
**Rationale:** Handle realistic import sizes (100-1000 items)

**Tasks:**
1. Implement chunked batch processing (configurable chunk size)
2. Add environment-based chunk size configuration
3. Update transaction timeout settings (60s for bulk operations)
4. Enhance error handling (track which chunks failed)
5. Add import summary response (created/updated/skipped counts)

**Why this order:**
- Chunking prevents transaction timeouts for large imports
- Configurable chunk size allows tuning per environment
- Transaction timeout prevents unexpected failures
- Error handling ensures visibility into partial failures

**Testing focus:**
- Load test with 100, 500, 1000 item datasets
- Verify memory usage stays reasonable
- Test partial failure scenarios (chunk 1 succeeds, chunk 2 fails)

### Phase 3: Observability (Optional)
**Duration:** 1 day
**Rationale:** Production readiness for monitoring

**Tasks:**
1. Add structured logging for import metrics (rows processed, time per chunk)
2. Add progress tracking (if needed for UI)
3. Consider adding performance monitoring integration

**Why defer:**
- Not critical for functionality
- Can be added based on production needs
- Easier to add after core patterns proven

## Phase Ordering Rationale

**Sequential over parallel:**
- Phase 1 establishes patterns that Phase 2 builds upon
- Performance optimization requires working baseline to measure against
- Observability needs real usage patterns to inform what to track

**Why not combine Phase 1 + 2:**
- Risk management - prove core functionality before optimizing
- Testing clarity - isolate history accuracy from performance tuning
- Code review focus - easier to review functional logic separate from performance logic

**Why Phase 3 is optional:**
- Can be added incrementally based on operational needs
- Existing error handling may be sufficient for initial rollout
- Cost/benefit depends on import frequency and criticality

## Research Flags for Phases

### Phase 1: Standard Patterns (Low Risk)
- **Unlikely to need deeper research** - All patterns exist in codebase
- **Known approach** - Interactive transactions already used for single edits
- **Clear validation** - Test with existing items to verify change detection

### Phase 2: Performance Testing (Medium Risk)
- **May need deeper research** - Optimal chunk size depends on:
  - Average import size (need user data)
  - Database server specs (need infrastructure details)
  - Concurrent user load (need usage patterns)
- **Validation approach:** Load testing with production-like data
- **Contingency:** Start with conservative chunk size (50-100), increase based on testing

### Phase 3: Monitoring Integration (Low Risk)
- **May need research** if integrating with specific monitoring tools
- **Standard patterns** for structured logging
- **Can leverage** existing error handling and response patterns

## Technical Decisions Summary

### ✅ Decisions Made (High Confidence)

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Use interactive transactions | Already proven for single edits | Separate transactions per item (less atomic) |
| Manual change detection | Explicit, type-safe, already working | Deep-diff libraries (over-engineered) |
| Custom history tables | Schema already optimal for domain | Generic audit libraries (incompatible) |
| Keep Prisma Decimal | No precision loss in database | Add Decimal.js (only if calculating) |
| Chunked batch processing | Prevents timeouts, manageable memory | Single transaction (risky for large imports) |

### ⚠️ Decisions Deferred (Requires Testing)

| Decision | Why Deferred | When to Decide |
|----------|--------------|----------------|
| Optimal chunk size | Depends on actual import sizes | During Phase 2 load testing |
| Parallel chunk processing | May not be needed for typical imports | After Phase 2 if performance insufficient |
| Decimal.js library | Only needed if backend calculates prices | If calculation logic added to import |
| Background job queue | Overkill unless imports are very large/frequent | If imports regularly exceed 1000+ items |

### ❌ Decisions Rejected (High Confidence)

| Decision | Why Rejected |
|----------|--------------|
| External audit logging library | Schema already has better structure, adds unnecessary complexity |
| Deep-diff libraries | Manual comparison is clearer and already implemented |
| Stream-based Excel parsing | ExcelJS loads to memory anyway, adds complexity for minimal benefit |
| Per-item transactions | Loss of atomicity, poor performance (N database round-trips) |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Transaction patterns** | HIGH | Pattern already exists in codebase for single edits |
| **Change detection** | HIGH | Extends existing `markIsChangedUnit` logic |
| **History schema** | HIGH | Schema already designed for this use case |
| **Decimal handling** | HIGH | Current approach (PostgreSQL Decimal + Prisma) is sufficient |
| **Batch performance** | MEDIUM | Chunking pattern is standard, but chunk size needs tuning |
| **Memory usage** | MEDIUM | ExcelJS memory footprint is known, but depends on file sizes |
| **Concurrent imports** | LOW | Need production data on import patterns and concurrency |

## Gaps to Address

### Known Unknowns
1. **Typical import size** - How many items in a typical Excel import?
   - **Impact:** Determines default chunk size and row limit
   - **Resolution:** Survey users or analyze historical import patterns (if logs exist)

2. **Concurrent import patterns** - Do users import simultaneously? From same location?
   - **Impact:** Affects database connection pool sizing and lock contention
   - **Resolution:** Analyze user behavior or start conservative (assume no concurrency)

3. **Error handling expectations** - Should partial imports succeed?
   - **Impact:** All-or-nothing vs. chunk-level atomicity
   - **Resolution:** Product decision (recommend chunk-level for better UX)

### Areas for Future Research
1. **Excel file validation** - Should we validate unit types, locations, etc. before processing?
   - Current implementation validates during processing (throws on invalid location)
   - Could pre-validate entire file before transaction
   - **Defer to:** Phase 1 implementation (improve validation based on real errors)

2. **Progress tracking** - Do users need real-time import progress?
   - Useful for large imports (1000+ items)
   - Requires WebSocket or polling mechanism
   - **Defer to:** Phase 3 (after understanding typical import sizes)

3. **Rollback strategy** - What happens if history records but upsert fails?
   - Transaction rollback handles this automatically
   - But should we retry failed chunks?
   - **Defer to:** Phase 2 (implement basic error handling, enhance based on production issues)

## Recommendations for Roadmap Builder

### Milestone Structure
**Recommended:** 2-phase milestone (Core + Performance)
- Phase 1: Core history tracking functionality (MVP)
- Phase 2: Performance optimization (production-ready)
- Phase 3: Observability (optional, can be separate milestone)

**Alternative:** 3-phase milestone (include observability)
- Use if import feature is business-critical
- Defer if imports are infrequent or low-volume

### Dependencies
**No blockers** - All requirements met by existing infrastructure

**Phase dependencies:**
- Phase 2 depends on Phase 1 (need baseline to measure performance)
- Phase 3 can run parallel to Phase 2 (observability independent of optimization)

### Success Criteria

**Phase 1 success:**
- ✅ History recorded for all updated items during import
- ✅ History details match existing single-edit format
- ✅ No history for newly created items (only updates)
- ✅ Transaction atomicity maintained (all-or-nothing for small imports)

**Phase 2 success:**
- ✅ Import of 500 items completes within 30 seconds
- ✅ Import of 1000 items completes within 60 seconds
- ✅ Memory usage stays under 200MB for 1000-item import
- ✅ Failed chunks reported with actionable error messages

**Phase 3 success (if included):**
- ✅ Import metrics logged (time, rows, success/failure)
- ✅ Failed imports traceable in logs
- ✅ Performance monitoring integrated (if applicable)

### Testing Strategy

**Phase 1:**
- Unit tests for change detection logic
- Integration tests for transaction + history creation
- Test data: 10-50 items, mix of new/existing

**Phase 2:**
- Load tests with 100, 500, 1000 item datasets
- Stress test: 5000 items (at row limit)
- Concurrent import test (if identified as concern)

**Phase 3:**
- Verify logs contain expected metrics
- Test error scenarios (database down, timeout, etc.)
- Validate monitoring alerts (if integrated)

## Conclusion

This milestone is **low-risk, high-confidence** because:
1. ✅ All required patterns already exist in codebase
2. ✅ Schema already designed for this exact use case
3. ✅ No new dependencies required for core functionality
4. ✅ Clear extension path from single-edit to bulk-import history

**Primary work is refactoring, not new feature development.** The research validates that the existing technical decisions (Prisma, PostgreSQL Decimal, custom history tables) are well-suited for this enhancement.

**Recommended approach:**
- Start with Phase 1 (core functionality) using single-transaction approach
- Add Phase 2 (chunking) only if Phase 1 testing reveals performance issues
- Defer Phase 3 (observability) until production usage patterns are understood

**Estimated effort:**
- Phase 1: 2-3 days (including testing)
- Phase 2: 1-2 days (including load testing)
- Phase 3: 1 day (optional)
- **Total: 3-6 days** depending on scope

**Risk mitigation:**
- Row limit (5000) prevents obvious performance disasters
- Chunk-level atomicity allows partial success (better UX than all-or-nothing for large imports)
- Existing patterns reduce implementation risk (proven approach)

The roadmap should emphasize that **this is an extension of working patterns**, not a new system. Focus implementation effort on thorough testing of change detection accuracy and performance tuning rather than architectural decisions.
