# Phase 1: Core History Integration - Execution Plan

## Overview

This phase extends the existing single-item history tracking functionality to work with bulk Excel imports. The implementation follows proven patterns from `updateItem()` in `item.service.ts` and reuses existing functions:

- `addItemHistory()` — Records history with before/after values
- `markIsChangedUnit()` — Detects which fields changed

**Critical Technical Change:** Refactor from `prisma.$transaction(array)` (parallel upserts) to `prisma.$transaction(callback)` (sequential processing) to enable history recording before each item upsert.

**Requirements Coverage:**
| Requirement | Description | Wave |
|-------------|-------------|------|
| FR-1 | Per-item change tracking | Wave 3 |
| FR-2 | Timestamp all changes | Automatic (Prisma) |
| FR-3 | User attribution | Wave 1 |
| FR-4 | Before/after value capture | Wave 4 |
| FR-5 | Transactional consistency | Wave 2 |
| FR-6 | Distinguish import from edit | Wave 4 |
| FR-7 | Query history by item | Wave 5 (verify existing) |
| FR-8 | Failed import rollback | Wave 2 |

---

## Waves (Execution Units)

### Wave 0: Test Infrastructure

**Goal:** Set up Vitest testing framework with transaction test helpers so all subsequent waves can include automated tests.

**Duration:** 30-45 minutes

**Depends on:** None (prerequisite for all other waves)

**Tasks:**

1. Install Vitest and dependencies:
   ```bash
   pnpm add -D vitest @vitest/ui
   ```

2. Create `vitest.config.ts` at project root:
   ```typescript
   import { defineConfig } from 'vitest/config';
   
   export default defineConfig({
     test: {
       globals: true,
       environment: 'node',
       setupFiles: ['./tests/setup.ts'],
       include: ['tests/**/*.test.ts'],
       testTimeout: 30000,
     },
   });
   ```

3. Create `tests/setup.ts` with database connection and cleanup:
   ```typescript
   import prisma from '../src/config/prisma.client';
   
   beforeAll(async () => {
     // Verify database connection
     await prisma.$connect();
   });
   
   afterAll(async () => {
     await prisma.$disconnect();
   });
   ```

4. Create `tests/helpers/transaction.helper.ts` with rollback wrapper:
   ```typescript
   import prisma from '../../src/config/prisma.client';
   import { Prisma } from '../../src/generated/prisma';
   
   export async function withRollback<T>(
     fn: (trx: Prisma.TransactionClient) => Promise<T>
   ): Promise<T> {
     let result: T;
     try {
       await prisma.$transaction(async (trx) => {
         result = await fn(trx);
         throw new Error('ROLLBACK'); // Force rollback after test
       });
     } catch (error: any) {
       if (error.message !== 'ROLLBACK') throw error;
     }
     return result!;
   }
   ```

5. Create `tests/factories/item.factory.ts` with test data generators:
   - `createTestItem()` — Creates a test item with units in database
   - `createTestUser()` — Creates a test user for history attribution
   - `mockImportItem()` — Creates import-shaped data for testing

6. Add test scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest",
       "test:ui": "vitest --ui"
     }
   }
   ```

7. Create initial smoke test `tests/unit/item.util.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { markIsChangedUnit } from '../../src/utils/item.util';
   
   describe('markIsChangedUnit', () => {
     it('should mark unit as changed when quantity differs', () => {
       const oldUnits = [{ id: 1, unitType: 'BOX', rate: 1, quantity: 10, purchasePrice: 100 }];
       const newUnits = [{ id: 1, unitType: 'BOX', rate: 1, quantity: 20, purchasePrice: 100 }];
       
       const result = markIsChangedUnit(newUnits, oldUnits);
       
       expect(result[0].isChanged).toBe(true);
     });
     
     it('should not mark unit as changed when values are identical', () => {
       const units = [{ id: 1, unitType: 'BOX', rate: 1, quantity: 10, purchasePrice: 100 }];
       
       const result = markIsChangedUnit([...units], [...units]);
       
       expect(result[0].isChanged).toBe(false);
     });
   });
   ```

**Verification:**
- [ ] `pnpm test` runs without errors
- [ ] Smoke test passes (2 tests green)
- [ ] Database connection established and closed cleanly
- [ ] Transaction helper compiles without type errors

**Commits:**
```
git commit -m "test(items): set up Vitest with transaction helpers and factories"
```

---

### Wave 1: Controller → Service Contract

**Goal:** Add user context (`req.user`) to the `importItem` call chain from controller through service, preparing for history recording which requires user ID and name.

**Duration:** 20-30 minutes

**Depends on:** Wave 0

**Tasks:**

1. Update `src/controllers/item.controller.ts` `importItem` function:
   - Add `req.user` as second parameter to service call
   - Before (line 135): `await itemService.importItem(req.file.buffer)`
   - After: `await itemService.importItem(req.file.buffer, req.user)`

2. Update `src/services/item.service.ts` `importItem` function signature:
   - Add `user: UserInfo` parameter after `buffer: Buffer`
   - Before (line 154): `const importItem = async (buffer: Buffer) => {`
   - After: `const importItem = async (buffer: Buffer, user: UserInfo) => {`
   - Note: `user` not used in this wave, just passed through

3. Create integration test `tests/integration/item.controller.test.ts`:
   ```typescript
   describe('importItem controller', () => {
     it('should pass user context to service layer', async () => {
       // Mock req.user and verify it reaches service
     });
   });
   ```

**Verification:**
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] Existing import functionality still works (manual test with small Excel file)
- [ ] `req.user` is accessible in service function (add console.log temporarily)

**Commits:**
```
git commit -m "feat(items): pass user context to import service [FR-3]"
```

---

### Wave 2: Transaction Refactoring

**Goal:** Refactor `importItems` model function from array-based to callback-based transaction pattern, ensuring all-or-nothing semantics and enabling sequential processing for history integration.

**Duration:** 45-60 minutes

**Depends on:** Wave 1

**Tasks:**

1. Create new function `importItemsWithTransaction` in `src/models/item.model.ts`:
   ```typescript
   const importItemsWithTransaction = async (
     items: ImportItems,
     trx: Prisma.TransactionClient
   ) => {
     const results = [];
     for (const item of items) {
       const result = await trx.item.upsert({
         where: { barcode: item.barcode || ' ' },
         update: { /* existing update fields */ },
         create: { /* existing create fields */ },
         include: { location: true, itemUnits: true },
       });
       results.push(result);
     }
     return results;
   };
   ```

2. Update `src/services/item.service.ts` `importItem` to use callback transaction:
   ```typescript
   const importItem = async (buffer: Buffer, user: UserInfo) => {
     // ... existing parsing logic ...
     
     const result = await prisma.$transaction(
       async (trx) => {
         return itemModel.importItemsWithTransaction(validatedItems, trx);
       },
       {
         maxWait: 10000,  // 10s to acquire lock
         timeout: 20000,  // 20s total execution
       }
     );
     
     return result;
   };
   ```

3. Keep old `importItems` function temporarily (for comparison)
   - Rename to `importItemsLegacy` 
   - Remove export from `item.model.ts`

4. Create integration test `tests/integration/item.service.test.ts`:
   ```typescript
   describe('importItem transaction', () => {
     it('should rollback all items if one fails', async () => {
       // Create import with valid items + one invalid location
       // Verify no items were created
     });
     
     it('should commit all items on success', async () => {
       // Create import with valid items
       // Verify all items exist in database
     });
   });
   ```

5. Add row limit validation in service (prevent timeout):
   ```typescript
   const MAX_IMPORT_ROWS = 5000;
   if (items.length > MAX_IMPORT_ROWS) {
     throw new BadRequestError(`Import exceeds maximum of ${MAX_IMPORT_ROWS} items`);
   }
   ```

**Verification:**
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (including rollback test)
- [ ] Manual test: Import with invalid location fails cleanly, no partial data
- [ ] Manual test: Import with valid data succeeds completely

**Commits:**
```
git commit -m "refactor(items): use callback transaction for imports [FR-5, FR-8]"
```

---

### Wave 3: Pre-fetch & Change Detection

**Goal:** Before each upsert, fetch existing item (if any) and use `markIsChangedUnit()` to detect which items actually changed, enabling history recording only for real updates.

**Duration:** 45-60 minutes

**Depends on:** Wave 2

**Tasks:**

1. Add `getItemByBarcodeWithTrx` function to `src/models/item.model.ts`:
   ```typescript
   const getItemByBarcodeWithTrx = async (
     barcode: string,
     trx: Prisma.TransactionClient
   ) => {
     return trx.item.findUnique({
       where: { barcode },
       include: { location: true, itemUnits: true },
     });
   };
   ```

2. Update `importItemsWithTransaction` to pre-fetch and detect changes:
   ```typescript
   const importItemsWithTransaction = async (
     items: ImportItems,
     user: UserInfo,
     trx: Prisma.TransactionClient
   ) => {
     const results = [];
     
     for (const item of items) {
       // 1. Fetch existing item (if any)
       const existingItem = item.barcode 
         ? await getItemByBarcodeWithTrx(item.barcode, trx)
         : null;
       
       // 2. Detect changes if existing
       let hasChanges = false;
       let oldUnits: UpdateUnit[] = [];
       let newUnitsWithFlags: UpdateUnit[] = [];
       
       if (existingItem) {
         // Parse Decimal to number for comparison
         oldUnits = existingItem.itemUnits.map(u => ({
           ...u,
           purchasePrice: u.purchasePrice.toNumber(),
         })) as UpdateUnit[];
         
         // Map import units to have IDs from existing item
         const mappedNewUnits = item.itemUnits.map((u, idx) => ({
           ...u,
           id: oldUnits[idx]?.id ?? -1,
         }));
         
         newUnitsWithFlags = markIsChangedUnit(mappedNewUnits, oldUnits);
         hasChanges = newUnitsWithFlags.some(u => u.isChanged);
       }
       
       // 3. Perform upsert (history recording comes in Wave 4)
       const result = await trx.item.upsert({
         where: { barcode: item.barcode || ' ' },
         update: { /* ... */ },
         create: { /* ... */ },
         include: { location: true, itemUnits: true },
       });
       
       results.push({
         item: result,
         wasUpdate: !!existingItem,
         hasChanges,
         oldUnits,
         newUnitsWithFlags,
       });
     }
     
     return results;
   };
   ```

3. Update service to pass `user` to model:
   - Before: `itemModel.importItemsWithTransaction(validatedItems, trx)`
   - After: `itemModel.importItemsWithTransaction(validatedItems, user, trx)`

4. Add unit tests for change detection edge cases:
   ```typescript
   describe('import change detection', () => {
     it('should detect quantity change', () => { /* ... */ });
     it('should detect price change', () => { /* ... */ });
     it('should not flag unchanged items', () => { /* ... */ });
     it('should handle new items (no existing)', () => { /* ... */ });
   });
   ```

**Verification:**
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
- [ ] Manual test: Add logging to verify `hasChanges` flag is accurate
- [ ] Decimal comparison works correctly (no false positives from precision)

**Commits:**
```
git commit -m "feat(items): pre-fetch and detect changes during import [FR-1]"
```

---

### Wave 4: History Recording

**Goal:** Call `addItemHistory()` for each changed item before the upsert, recording before/after values with action type "import" and user attribution.

**Duration:** 30-45 minutes

**Depends on:** Wave 3

**Tasks:**

1. Update `importItemsWithTransaction` to record history:
   ```typescript
   // After change detection, before upsert:
   if (existingItem && hasChanges) {
     await addItemHistory(
       newUnitsWithFlags,
       oldUnits,
       user,
       'import',  // FR-6: action type
       existingItem.id,
       trx
     );
   }
   ```

2. Verify `addItemHistory` handles "import" action correctly:
   - Check existing function accepts `HistoryAction` type
   - Verify `HistoryAction.import` exists in Prisma schema

3. Add integration tests for history recording:
   ```typescript
   describe('import history recording', () => {
     it('should create history record for changed items [FR-4, FR-6]', async () => {
       // Create existing item, import with different quantity
       // Verify ItemHistory record created with action='import'
     });
     
     it('should capture before/after values [FR-4]', async () => {
       // Verify ItemHistoryDetail has correct old/new values
     });
     
     it('should include user attribution [FR-3]', async () => {
       // Verify ItemHistory has userId and userName
     });
     
     it('should NOT create history for new items', async () => {
       // Import new barcode, verify no history
     });
     
     it('should NOT create history for unchanged items', async () => {
       // Import with identical values, verify no history
     });
   });
   ```

4. Ensure timestamp is auto-populated (verify Prisma schema):
   - `createdAt DateTime @default(now())` in ItemHistory model

**Verification:**
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (all history tests green)
- [ ] Manual test: Import updated items, query history via API
- [ ] History shows "import" action type, correct user, correct values

**Commits:**
```
git commit -m "feat(items): record history for changed items during import [FR-3, FR-4, FR-6]"
```

---

### Wave 5: End-to-End Integration

**Goal:** Complete the import flow with history, update return values to include summary statistics, and verify existing history query endpoint works correctly.

**Duration:** 30-45 minutes

**Depends on:** Wave 4

**Tasks:**

1. Update service to return import summary:
   ```typescript
   // Transform model results to summary
   const summary = {
     total: results.length,
     created: results.filter(r => !r.wasUpdate).length,
     updated: results.filter(r => r.wasUpdate && r.hasChanges).length,
     unchanged: results.filter(r => r.wasUpdate && !r.hasChanges).length,
   };
   
   return {
     items: results.map(r => r.item),
     summary,
   };
   ```

2. Update controller response to include summary:
   ```typescript
   sendResponse(res, 201, "Items imported successfully", {
     items: result.items,
     summary: result.summary,
   });
   ```

3. Verify existing history query endpoint (`getItemHistoriesById`):
   - Test: Import items → Query history → See import records
   - Verify ordering (newest first)
   - Verify action type filter works

4. Add E2E integration test:
   ```typescript
   describe('import flow E2E', () => {
     it('should complete full import with history', async () => {
       // 1. Create test item in database
       // 2. Create Excel buffer with updated values
       // 3. Call importItem service
       // 4. Verify item updated
       // 5. Verify history created with correct values
       // 6. Query history via getItemHistoriesById
       // 7. Verify import history appears in results
     });
     
     it('should rollback history on import failure', async () => {
       // 1. Create item with valid data
       // 2. Import with mix of valid + invalid items
       // 3. Verify transaction rolled back
       // 4. Verify no history records created
     });
   });
   ```

5. Add error handling for edge cases:
   - Handle null barcode gracefully
   - Handle missing unit IDs in import

**Verification:**
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (all E2E tests green)
- [ ] Manual test: Full import flow with history visible in API response
- [ ] Verify import summary counts are accurate

**Commits:**
```
git commit -m "feat(items): complete import flow with history and summary [FR-7]"
```

---

### Wave 6: Verification & Cleanup

**Goal:** Run comprehensive verification against all success criteria, clean up temporary code, and document any known limitations.

**Duration:** 20-30 minutes

**Depends on:** Wave 5

**Tasks:**

1. Run full test suite with coverage:
   ```bash
   pnpm add -D @vitest/coverage-v8
   pnpm test -- --coverage
   ```

2. Verify against success criteria (manual testing):

   | Success Criteria | Test Steps | Expected Result |
   |------------------|------------|-----------------|
   | SC-1: Mix of new/existing | Import file with new + existing barcodes | Only existing items with changes have history |
   | SC-2: History query | GET `/api/v1/item-histories?itemId={id}` | Import changes visible alongside edit changes |
   | SC-3: Decimal precision | Import item with price 99.99 | History shows exact 99.99, not 99.98999... |
   | SC-4: Action type | Check history record | action='import', userId and userName populated |
   | SC-5: Rollback | Import with invalid location in middle | Entire import fails, no orphaned records |

3. Remove legacy code:
   - Delete `importItemsLegacy` function if still present
   - Remove any console.log statements added during development

4. Update JSDoc comments:
   ```typescript
   /**
    * Import items from Excel with history tracking.
    * @param buffer - Excel file buffer
    * @param user - Authenticated user (for history attribution)
    * @returns Import results with summary statistics
    * @throws BadRequestError if file format invalid or row limit exceeded
    * @throws NotFoundError if location not found
    */
   ```

5. Create `VERIFICATION-NOTES.md` documenting:
   - Any known limitations
   - Performance characteristics observed
   - Edge cases handled

**Verification:**
- [ ] All 8 functional requirements verified
- [ ] Test coverage > 70% for modified files
- [ ] No console.log or debug code remaining
- [ ] All success criteria pass manually

**Commits:**
```
git commit -m "test(items): add verification tests and clean up [Phase 1 Complete]"
```

---

## Dependency Graph

```
Wave 0 (Test Infrastructure)
   │
   ▼
Wave 1 (User Context) ────────────────────┐
   │                                       │
   ▼                                       │
Wave 2 (Transaction) ◄────────────────────┤
   │                                       │
   ▼                                       │
Wave 3 (Pre-fetch & Detection) ◄──────────┤
   │                                       │
   ▼                                       │
Wave 4 (History Recording) ◄──────────────┘
   │
   ▼
Wave 5 (E2E Integration)
   │
   ▼
Wave 6 (Verification)
```

## Risk Mitigations

| Risk | Mitigation | Wave |
|------|------------|------|
| Transaction timeout on large imports | Configure 20s timeout + 5000 row limit | Wave 2 |
| Decimal precision loss | Convert Prisma Decimal to number before comparison | Wave 3 |
| Missing user context | Validate req.user exists in controller | Wave 1 |
| Orphaned history records | Record history BEFORE upsert, single transaction | Wave 4 |
| N+1 query performance | Accept for Phase 1, optimize in Phase 2 | Wave 3 |

## Files Modified

| Wave | Files |
|------|-------|
| 0 | `vitest.config.ts`, `tests/setup.ts`, `tests/helpers/*`, `tests/factories/*`, `package.json` |
| 1 | `src/controllers/item.controller.ts`, `src/services/item.service.ts` |
| 2 | `src/models/item.model.ts`, `src/services/item.service.ts` |
| 3 | `src/models/item.model.ts`, `src/utils/item.util.ts` (no change, just used) |
| 4 | `src/models/item.model.ts` |
| 5 | `src/services/item.service.ts`, `src/controllers/item.controller.ts` |
| 6 | Documentation only |

## Estimated Total Duration

| Wave | Duration | Cumulative |
|------|----------|------------|
| 0 | 30-45 min | 45 min |
| 1 | 20-30 min | 1h 15m |
| 2 | 45-60 min | 2h 15m |
| 3 | 45-60 min | 3h 15m |
| 4 | 30-45 min | 4h |
| 5 | 30-45 min | 4h 45m |
| 6 | 20-30 min | 5h 15m |

**Total: ~5-6 hours of execution time**

---

*Plan created: 2025-01-14*  
*Phase: 01-core-history-integration*
