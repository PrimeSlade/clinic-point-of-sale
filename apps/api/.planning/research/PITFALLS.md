# Domain Pitfalls: Bulk Import with Item History

**Domain:** Excel bulk import with audit trail in inventory management  
**Researched:** 2025-01-17  
**Codebase Analysis:** Based on existing implementation at commit state

---

## Executive Summary

Adding history tracking to bulk Excel imports introduces significant complexity beyond single-item updates. The critical risks center on **transactional atomicity** (all-or-nothing import+history), **performance degradation** from N+1 queries, **data integrity** from double-history recording, and **operational complexity** from partial failures without proper error reporting.

**Confidence Level:** HIGH — Based on direct codebase analysis revealing existing patterns, known technical debt, and architectural constraints.

---

## Critical Pitfalls

These mistakes cause data corruption, production outages, or require database rollbacks.

### Pitfall 1: Double-History Recording for Same Import
**What goes wrong:** If import retries or Excel file contains duplicate barcodes, history records created multiple times for the same change.

**Why it happens:**  
- Current `importItems()` uses `upsert` in array transaction (line 173-220 in `item.model.ts`)
- No idempotency key or import session tracking
- If transaction partially commits before failure, retry creates duplicate history
- Excel file can have same barcode in multiple rows (not validated)

**Consequences:**  
- History table polluted with duplicate entries
- Cannot determine actual change timeline
- Storage bloat from redundant records
- User sees multiple identical history entries for same import

**Prevention:**
```typescript
// Add import session tracking
const importSession = crypto.randomUUID();

// Group by barcode first to detect duplicates
const uniqueItems = new Map();
items.forEach(item => {
  if (uniqueItems.has(item.barcode)) {
    throw new BadRequestError(
      `Duplicate barcode ${item.barcode} found in rows ${uniqueItems.get(item.barcode).row} and ${item.row}`
    );
  }
  uniqueItems.set(item.barcode, item);
});

// Track import session in history
await itemModel.addItemHistory(
  newUnit,
  oldUnit,
  user,
  "import",
  itemId,
  trx,
  { importSessionId: importSession } // Add session tracking
);
```

**Detection:**  
- Query history table: `SELECT itemId, COUNT(*) FROM item_histories WHERE action = 'import' GROUP BY itemId, createdAt HAVING COUNT(*) > 1`
- Monitor for identical timestamps with same itemId
- Add database unique constraint: `@@unique([itemId, importSessionId])` if adding session tracking

---

### Pitfall 2: Partial Transaction Commit on Memory Exhaustion
**What goes wrong:** Large Excel imports (500+ items) cause Node.js heap exhaustion mid-transaction, leaving database in inconsistent state.

**Why it happens:**  
- Current implementation loads entire Excel file into memory (line 154-196 in `item.service.ts`)
- `transformImportedData()` creates full in-memory array with all items
- Prisma transaction array (`prisma.$transaction([...])`) keeps all operations in memory until commit
- ExcelJS loads full workbook into memory (`workbook.xlsx.load(buffer)`)
- No streaming or chunking

**Consequences:**  
- Node.js process crashes with `JavaScript heap out of memory`
- PostgreSQL transaction may or may not rollback depending on connection state
- Items imported before crash exist in database
- No history records created (addItemHistory never called)
- User has no idea which items succeeded

**Prevention:**
```typescript
// Chunk processing with configurable batch size
const BATCH_SIZE = 50; // Tune based on memory profile

for (let i = 0; i < validatedItems.length; i += BATCH_SIZE) {
  const batch = validatedItems.slice(i, i + BATCH_SIZE);
  
  await prisma.$transaction(async (trx) => {
    for (const item of batch) {
      // Fetch old item state
      const oldItem = await trx.item.findUnique({ 
        where: { barcode: item.barcode },
        include: { itemUnits: true }
      });
      
      // Upsert item
      const updatedItem = await trx.item.upsert({
        where: { barcode: item.barcode || " " },
        update: { /* ... */ },
        create: { /* ... */ },
        include: { itemUnits: true }
      });
      
      // Only add history if item existed and changed
      if (oldItem) {
        const newUnit = markIsChangedUnit(
          updatedItem.itemUnits,
          oldItem.itemUnits
        );
        
        if (newUnit.some(u => u.isChanged)) {
          await itemModel.addItemHistory(
            newUnit,
            oldItem.itemUnits,
            user,
            "import",
            updatedItem.id,
            trx
          );
        }
      }
    }
  }, {
    timeout: 60000, // 60s per batch
    maxWait: 5000   // Wait max 5s for transaction to start
  });
}
```

**Detection:**  
- Monitor Node.js heap usage: `process.memoryUsage().heapUsed`
- Add memory usage logging before/after import
- Set up alerts for heap usage >80%
- Load test with realistic Excel file sizes (100, 500, 1000 rows)

---

### Pitfall 3: N+1 Query Explosion from Sequential History Creation
**What goes wrong:** Creating history for 500 items requires 1000+ database queries (2 per item: fetch old + create history), causing 30+ second import times and potential timeouts.

**Why it happens:**  
- Current `importItems()` uses array of separate `upsert` operations (line 173-220)
- Each upsert is isolated — no batching
- To add history, need to fetch old item state before each upsert
- `markIsChangedUnit()` requires both old and new state in memory
- Prisma's `$transaction([...])` doesn't batch reads/writes efficiently

**Consequences:**  
- Import time grows linearly: O(n) items × 2 queries/item = O(2n) queries
- Database connection pool exhaustion under concurrent imports
- User timeout (default 30s in most setups)
- Lock contention on item table if multiple imports running

**Prevention:**
```typescript
// Batch fetch all existing items by barcodes
const barcodes = validatedItems.map(i => i.barcode).filter(Boolean);
const existingItems = await prisma.item.findMany({
  where: { barcode: { in: barcodes } },
  include: { itemUnits: true }
});

// Create lookup map for O(1) access
const existingItemsMap = new Map(
  existingItems.map(item => [item.barcode, item])
);

// Process in transaction with batched creates
await prisma.$transaction(async (trx) => {
  const historyRecords = [];
  
  for (const item of validatedItems) {
    const oldItem = existingItemsMap.get(item.barcode);
    
    const updatedItem = await trx.item.upsert({ /* ... */ });
    
    // Collect history records for batch insert
    if (oldItem) {
      const newUnit = markIsChangedUnit(
        updatedItem.itemUnits,
        oldItem.itemUnits
      );
      
      const changedUnits = newUnit.filter(u => u.isChanged);
      if (changedUnits.length > 0) {
        historyRecords.push({
          userName: user.name,
          userId: user.id,
          action: "import",
          itemId: updatedItem.id,
          itemHistoryDetails: {
            createMany: {
              data: changedUnits.map(unit => {
                const oldUnit = oldItem.itemUnits.find(o => o.id === unit.id)!;
                return {
                  oldUnitType: oldUnit.unitType,
                  newUnitType: unit.unitType,
                  oldRate: oldUnit.rate,
                  newRate: unit.rate,
                  oldQuantity: oldUnit.quantity,
                  newQuantity: unit.quantity,
                  oldPurchasePrice: oldUnit.purchasePrice,
                  newPurchasePrice: unit.purchasePrice,
                };
              })
            }
          }
        });
      }
    }
  }
  
  // Batch insert all history records
  await trx.itemHistory.createMany({
    data: historyRecords
  });
});
```

**Detection:**  
- Enable Prisma query logging: `log: ['query']` in Prisma client
- Count queries per import: Should be ~2-3 queries total, not 2×N
- Add performance metrics: Track import time per row
- Alert if import time >500ms per 10 items

---

### Pitfall 4: Transaction Timeout with No Partial Progress Indication
**What goes wrong:** 1000-item import takes 45 seconds, exceeds default 30s timeout, transaction rolls back, user has no idea how much succeeded.

**Why it happens:**  
- Prisma's default interactive transaction timeout is 30 seconds
- Current implementation has no timeout configuration
- Single transaction for entire import (all-or-nothing)
- No progress reporting to user
- No distinction between "import failed" vs "import timed out"

**Consequences:**  
- User waits 30+ seconds then sees generic error
- All work discarded — must re-upload entire file
- Cannot identify if issue is data validation vs timeout
- No way to resume partial import
- Production systems unusable during large imports

**Prevention:**
```typescript
// Configure transaction timeout based on file size
const estimatedDuration = validatedItems.length * 100; // 100ms per item estimate
const timeoutMs = Math.min(Math.max(estimatedDuration, 30000), 300000); // 30s-5min

await prisma.$transaction(async (trx) => {
  // ... import logic with progress tracking
  
  let processed = 0;
  for (const batch of chunks(validatedItems, BATCH_SIZE)) {
    await processBatch(batch, trx);
    processed += batch.length;
    
    // Optional: Log progress (cannot send to client mid-transaction)
    console.log(`Processed ${processed}/${validatedItems.length} items`);
  }
}, {
  timeout: timeoutMs,
  maxWait: 10000
});

// Alternative: Stream processing with checkpoints
// Break into multiple transactions with progress tracking
const results = {
  total: validatedItems.length,
  succeeded: 0,
  failed: 0,
  errors: []
};

for (let i = 0; i < validatedItems.length; i += BATCH_SIZE) {
  try {
    await prisma.$transaction(async (trx) => {
      // Process batch
    });
    results.succeeded += BATCH_SIZE;
  } catch (error) {
    results.failed += BATCH_SIZE;
    results.errors.push({
      batch: Math.floor(i / BATCH_SIZE),
      error: error.message
    });
  }
}

return results; // User can see partial progress
```

**Detection:**  
- Monitor transaction duration with middleware timing
- Add timeout error differentiation in error handler
- Log transaction start/end with row counts
- Alert on transactions >20s

---

## Moderate Pitfalls

These cause incorrect behavior but don't corrupt data or crash systems.

### Pitfall 5: Incorrect Change Detection from Decimal Precision Mismatch
**What goes wrong:** Excel stores `10.50` but Prisma Decimal comparison treats `10.5` as different, creating false-positive history entries.

**Why it happens:**  
- Excel number precision differs from PostgreSQL `DECIMAL(10,2)`
- JavaScript Number → Prisma Decimal conversion loses precision
- Current `markIsChangedUnit()` uses `!==` for all comparisons (line 103-107 in `item.util.ts`)
- Decimal comparison without normalization: `Decimal(10.50) !== Decimal(10.5)` may be true

**Consequences:**  
- History records created for unchanged items
- Every import generates spurious history entries
- Cannot trust history as audit trail
- Storage growth from false positives

**Prevention:**
```typescript
// Normalize decimals for comparison
const markIsChangedUnit = (
  newUnit: Array<UpdateUnit>,
  oldUnit: Array<UpdateUnit>,
) => {
  return newUnit.map((unit) => {
    const matchOldUnit = oldUnit.find((o) => o.id === unit.id);

    if (matchOldUnit) {
      // Normalize decimal comparison with toFixed
      const oldPrice = new Decimal(matchOldUnit.purchasePrice).toFixed(2);
      const newPrice = new Decimal(unit.purchasePrice).toFixed(2);
      
      unit.isChanged =
        unit.unitType !== matchOldUnit.unitType ||
        unit.rate !== matchOldUnit.rate ||
        unit.quantity !== matchOldUnit.quantity ||
        oldPrice !== newPrice; // String comparison of normalized values
    }
    return unit;
  });
};
```

**Detection:**  
- Query history where only purchasePrice changed by <0.01
- Compare Excel source values with database values
- Add test: Import same file twice, verify zero history records on second import

---

### Pitfall 6: Silent History Skipping When Item Not Found
**What goes wrong:** Excel row references barcode that doesn't exist yet (new item), history creation fails silently or creates orphaned records.

**Why it happens:**  
- Current `importItems()` uses `upsert` which creates OR updates
- For new items (create path), no old state exists
- `markIsChangedUnit()` expects matching old units by ID
- `addItemHistory()` expects itemId to exist
- No distinction between "new item" vs "updated item" in history

**Consequences:**  
- New items in import have no history trail
- Cannot distinguish "item created via import" from "item always existed"
- `markIsChangedUnit()` crashes if old unit IDs don't match (line 100-110)
- Audit trail incomplete

**Prevention:**
```typescript
// Distinguish create vs update paths
await prisma.$transaction(async (trx) => {
  for (const item of validatedItems) {
    const existingItem = await trx.item.findUnique({
      where: { barcode: item.barcode || " " },
      include: { itemUnits: true }
    });
    
    const updatedItem = await trx.item.upsert({ /* ... */ });
    
    if (existingItem) {
      // CASE 1: Update existing item - check for changes
      const newUnit = markIsChangedUnit(
        updatedItem.itemUnits,
        existingItem.itemUnits
      );
      
      if (newUnit.some(u => u.isChanged)) {
        await itemModel.addItemHistory(
          newUnit,
          existingItem.itemUnits,
          user,
          "import",
          updatedItem.id,
          trx
        );
      }
    } else {
      // CASE 2: New item creation - record creation event
      await trx.itemHistory.create({
        data: {
          userName: user.name,
          userId: user.id,
          action: "import",
          itemId: updatedItem.id,
          // No details for new items (no old state)
        }
      });
    }
  }
});
```

**Detection:**  
- Count items created via import: `SELECT COUNT(*) FROM items WHERE barcode IN (excel_barcodes) AND createdAt > import_start`
- Count history records for same period: Should match
- Alert if discrepancy >10%

---

### Pitfall 7: Race Condition from Concurrent Imports of Same Items
**What goes wrong:** Two users import Excel files affecting same items simultaneously; one transaction overwrites the other's changes; history records conflict.

**Why it happens:**  
- No row-level locking on items during import
- Prisma `upsert` uses last-write-wins semantics
- History records both succeed (different timestamps)
- No conflict detection between concurrent imports

**Consequences:**  
- History shows both imports succeeded
- Actual final state reflects only last commit
- Earlier import's changes lost
- Cannot reconcile which history is authoritative

**Prevention:**
```typescript
// Add row-level locking with SELECT FOR UPDATE
await prisma.$transaction(async (trx) => {
  // Lock all items being updated
  const barcodes = validatedItems.map(i => i.barcode).filter(Boolean);
  
  // Raw query for row-level locking
  await trx.$executeRaw`
    SELECT id FROM items 
    WHERE barcode = ANY(${barcodes}::text[])
    FOR UPDATE NOWAIT
  `;
  
  // Now safe to process - other transactions will fail fast
  for (const item of validatedItems) {
    // ... upsert and history logic
  }
}, {
  timeout: 60000
});

// Handle lock acquisition failure
try {
  await importWithLocking();
} catch (error) {
  if (error.code === 'P2034') { // Prisma lock timeout
    throw new BadRequestError(
      'Another import is in progress for these items. Please wait and try again.'
    );
  }
  throw error;
}
```

**Detection:**  
- Monitor for concurrent import transactions: Query `pg_stat_activity`
- Add application-level import locking (Redis distributed lock)
- Log warning when multiple imports detected in same time window

---

### Pitfall 8: Unit Conversion Cascade Breaking History Accuracy
**What goes wrong:** Import updates quantity for "box" unit; cascading recalculation changes "tablet" and "strip" quantities; history only records "box" change.

**Why it happens:**  
- Current `recalculateRelatedUnits()` mutates array in-place (lines 15-43 in `invoice.operations.ts`)
- Import doesn't call unit recalculation (different code path from invoice)
- If import does call recalculation, cascade changes aren't marked as `isChanged`
- History only records direct changes, not cascade effects

**Consequences:**  
- Quantities in database don't match quantities in history
- Cannot reverse changes (history incomplete)
- Audit trail shows box=10 changed but not tablet=100 recalculated

**Prevention:**
```typescript
// Mark cascaded changes in recalculateRelatedUnits
const recalculateRelatedUnits = (
  itemUnit: { id: number; quantity: number; rate: number; isChanged?: boolean }[],
  matchIndex: number,
) => {
  if (matchIndex === 0) {
    for (let i = matchIndex; i < itemUnit.length - 1; i++) {
      const newQuantity = itemUnit[i].quantity * itemUnit[i].rate;
      if (itemUnit[i + 1].quantity !== newQuantity) {
        itemUnit[i + 1].quantity = newQuantity;
        itemUnit[i + 1].isChanged = true; // Mark cascaded change
      }
    }
  }
  // ... similar for up and middle cases
};

// In import, detect and record cascade changes
const oldUnits = deepClone(existingItem.itemUnits);
recalculateRelatedUnits(newUnits, changedIndex);

const allChangedUnits = newUnits.filter((unit, i) => {
  return !deepEqual(unit, oldUnits[i]); // Compare all fields
});

// Record all changes (direct + cascade)
await itemModel.addItemHistory(
  allChangedUnits,
  oldUnits,
  user,
  "import",
  itemId,
  trx
);
```

**Detection:**  
- Compare item quantities before/after import
- Verify all related units marked changed
- Test: Import with unit rate changes, verify cascade recorded

---

## Minor Pitfalls

These cause inconvenience but have limited impact.

### Pitfall 9: Excel Date Parsing Creating Wrong Expiry Dates
**What goes wrong:** Excel date in cell displays "12/31/2025" but imports as "12/30/2025" due to timezone/format differences.

**Why it happens:**  
- ExcelJS parses dates based on system timezone
- Excel stores dates as numeric offsets
- No explicit date format validation
- `row.getCell(5).value` returns Date object with time component
- PostgreSQL `@db.Date` stores without time, but conversion may shift day

**Consequences:**  
- Items marked as expired prematurely
- Inventory blocking incorrect
- History shows wrong expiry dates

**Prevention:**
```typescript
// Normalize dates to UTC midnight
const normalizeExcelDate = (value: any): Date => {
  if (value instanceof Date) {
    // Strip time component, force UTC
    return new Date(Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    ));
  }
  throw new BadRequestError(`Invalid date format: ${value}`);
};

// In import
expiredDate: normalizeExcelDate(row.getCell(5).value)
```

**Detection:**  
- Compare Excel source dates with imported dates
- Add validation: Reject dates with time component
- Test with multiple timezone settings

---

### Pitfall 10: No Rollback for User When Import Fails After 2 Minutes
**What goes wrong:** Import processes 800/1000 items then hits validation error; transaction rolls back; user has no indication which 800 succeeded before failure.

**Why it happens:**  
- Single atomic transaction means all-or-nothing
- No intermediate checkpoints
- Error message doesn't include progress context

**Consequences:**  
- User doesn't know if any items imported
- Must re-upload entire file
- Cannot isolate problematic rows

**Prevention:**
```typescript
// Validate entire file before starting transaction
const validationErrors = [];

for (const [index, item] of importedData.entries()) {
  try {
    validateItem(item); // Throws on error
  } catch (error) {
    validationErrors.push({
      row: index + 2, // +2 for header + 0-index
      error: error.message
    });
  }
}

if (validationErrors.length > 0) {
  throw new BadRequestError(
    `Validation failed for ${validationErrors.length} rows:\n` +
    validationErrors.slice(0, 10).map(e => 
      `Row ${e.row}: ${e.error}`
    ).join('\n') +
    (validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more` : '')
  );
}

// Now safe to start transaction - all data is valid
await prisma.$transaction(async (trx) => {
  // Process validated items
});
```

**Detection:**  
- Track validation errors vs transaction errors
- Log where in file error occurred
- Return row number in error message

---

### Pitfall 11: History User Attribution Lost for Bulk Imports
**What goes wrong:** All history entries show same user/timestamp; cannot determine which items each admin imported in multi-admin scenario.

**Why it happens:**  
- History records `userName` and `userId` but not per-item context
- All items in import get same `createdAt` timestamp
- No import batch identifier

**Consequences:**  
- Cannot attribute specific changes to import batch
- Cannot compare "before this import" vs "after this import"
- Difficult to investigate import-related issues

**Prevention:**
```typescript
// Add import metadata to history
const importMetadata = {
  fileName: originalFileName,
  rowCount: validatedItems.length,
  uploadedAt: new Date(),
  checksum: calculateChecksum(buffer)
};

await trx.itemHistory.create({
  data: {
    userName: user.name,
    userId: user.id,
    action: "import",
    itemId: itemId,
    metadata: importMetadata, // Store import context
    itemHistoryDetails: { /* ... */ }
  }
});
```

**Detection:**  
- Query history: Group by timestamp, verify metadata exists
- Add import ID to history table schema
- Test: Multiple imports, verify distinguishable

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Change Detection** | Decimal comparison false positives | Normalize decimals with `toFixed(2)` before comparison; add test importing same file twice |
| **Transaction Management** | Memory exhaustion on large files | Chunk processing with max 50 items/batch; stream Excel parsing if files >1000 rows |
| **History Recording** | N+1 query explosion | Batch fetch existing items upfront; collect history records and bulk insert |
| **Error Handling** | No progress indication on timeout | Pre-validate entire file; add timeout configuration based on file size |
| **Testing** | No way to test transaction rollback | Add test helpers to simulate mid-transaction errors; verify database state unchanged |
| **Integration** | Breaking existing single-item update | Keep existing `updateItem()` unchanged; create new `importItemsWithHistory()` function |

---

## Testing Pitfalls

Critical testing challenges for this feature.

### Challenge 1: Testing Transaction Rollback Scenarios
**Problem:** Need to verify that if history creation fails, item updates also roll back.

**Approach:**
```typescript
// Test helper to simulate mid-transaction failure
it('should rollback item updates when history creation fails', async () => {
  // Mock addItemHistory to throw error
  vi.spyOn(itemModel, 'addItemHistory').mockRejectedValueOnce(
    new Error('History creation failed')
  );
  
  const beforeCount = await prisma.item.count();
  
  await expect(
    importItem(validExcelBuffer)
  ).rejects.toThrow('History creation failed');
  
  const afterCount = await prisma.item.count();
  
  // Verify no items were added despite upsert succeeding
  expect(afterCount).toBe(beforeCount);
});
```

### Challenge 2: Testing Change Detection Accuracy
**Problem:** Need to verify `markIsChangedUnit()` correctly identifies changed vs unchanged units.

**Approach:**
```typescript
// Test with known change scenarios
it('should detect quantity change but not price', () => {
  const oldUnits = [
    { id: 1, unitType: 'box', quantity: 10, rate: 1, purchasePrice: 100.00 }
  ];
  const newUnits = [
    { id: 1, unitType: 'box', quantity: 15, rate: 1, purchasePrice: 100.00 }
  ];
  
  const result = markIsChangedUnit(newUnits, oldUnits);
  
  expect(result[0].isChanged).toBe(true);
});

it('should not detect change for equivalent decimals', () => {
  const oldUnits = [
    { id: 1, unitType: 'box', quantity: 10, rate: 1, purchasePrice: 100.50 }
  ];
  const newUnits = [
    { id: 1, unitType: 'box', quantity: 10, rate: 1, purchasePrice: 100.5 } // Note: .5 vs .50
  ];
  
  const result = markIsChangedUnit(newUnits, oldUnits);
  
  expect(result[0].isChanged).toBe(false); // Should normalize
});
```

### Challenge 3: Testing with Realistic Data Volumes
**Problem:** Need to verify performance doesn't degrade with 500+ items.

**Approach:**
```typescript
// Generate large test dataset
const generateTestExcel = async (itemCount: number) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Items');
  
  worksheet.columns = [ /* ... headers ... */ ];
  
  for (let i = 0; i < itemCount; i++) {
    worksheet.addRow({
      warehouse: 'Test Location',
      itemName: `Test Item ${i}`,
      barcode: `BARCODE${i}`,
      // ... other fields
    });
  }
  
  return workbook.xlsx.writeBuffer();
};

it('should import 500 items within 10 seconds', async () => {
  const buffer = await generateTestExcel(500);
  
  const start = Date.now();
  await importItem(buffer);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(10000); // 10s max
});
```

---

## Operational Pitfalls

### Pitfall 12: No Way to Debug Failed Import When History Involved
**What goes wrong:** User reports "import failed" but logs show only generic Prisma error; cannot determine if issue was item validation, history creation, or transaction timeout.

**Prevention:**
```typescript
// Structured logging with context
import { logger } from './logger'; // Winston/Pino

const importItem = async (buffer: Buffer) => {
  const importId = crypto.randomUUID();
  
  logger.info('Import started', { 
    importId, 
    fileSize: buffer.length,
    user: user.email 
  });
  
  try {
    // Parse Excel
    logger.debug('Parsing Excel', { importId, stage: 'parse' });
    const items = await transformImportedData(importedData);
    
    // Validate
    logger.debug('Validating items', { 
      importId, 
      stage: 'validate',
      itemCount: items.length 
    });
    const validatedItems = validateItems(items);
    
    // Import with history
    logger.debug('Starting transaction', { 
      importId, 
      stage: 'transaction' 
    });
    
    await prisma.$transaction(async (trx) => {
      for (const [index, item] of validatedItems.entries()) {
        logger.debug('Processing item', { 
          importId, 
          stage: 'item',
          index,
          barcode: item.barcode 
        });
        
        // ... upsert logic
        
        logger.debug('Adding history', { 
          importId, 
          stage: 'history',
          index,
          itemId: updatedItem.id 
        });
        
        // ... history logic
      }
    });
    
    logger.info('Import completed', { 
      importId, 
      itemCount: validatedItems.length 
    });
    
    return { success: true, importId };
    
  } catch (error) {
    logger.error('Import failed', { 
      importId,
      error: error.message,
      stack: error.stack,
      stage: error.stage // Custom property
    });
    throw error;
  }
};
```

---

## Sources

### Codebase Analysis
- **MEDIUM Confidence** — Direct codebase inspection
- `src/services/item.service.ts` (lines 154-211) — Current import implementation
- `src/models/item.model.ts` (lines 172-221, 223-258) — Import model and history function
- `src/utils/item.util.ts` (lines 95-111) — Change detection logic
- `src/utils/invoice.operations.ts` (lines 73-134) — N+1 query pattern in adjustUnitAmount
- `.planning/codebase/CONCERNS.md` — Known technical debt documentation

### Domain Knowledge
- **HIGH Confidence** — Best practices for transactional systems
- Prisma transaction documentation: Interactive transactions timeout defaults (https://www.prisma.io/docs/orm/prisma-client/queries/transactions#transaction-timing-issues)
- PostgreSQL row-level locking: SELECT FOR UPDATE NOWAIT pattern
- ExcelJS memory constraints: Full workbook loading vs streaming
- Audit trail design patterns: Idempotency keys and session tracking

### Known Issues from Existing Code
- **HIGH Confidence** — Documented in CONCERNS.md
- Silent failures in error handling (invoice.operations.ts line 88-92)
- Decimal precision loss via toNumber() conversions
- N+1 query patterns in invoice operations
- Excel import without streaming (item.service.ts line 154-196)
- Zero test coverage complicating verification

---

*Pitfalls research: 2025-01-17 based on codebase commit state*
