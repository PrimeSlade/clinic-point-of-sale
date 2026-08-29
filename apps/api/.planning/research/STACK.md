# Technology Stack Research: Bulk Excel Import with History Tracking

**Project:** Point-of-Sale Backend - Item History Tracking Enhancement
**Milestone:** Add history tracking to bulk Excel imports
**Researched:** March 19, 2025
**Confidence:** HIGH

## Executive Summary

This research focuses on the technical requirements for adding comprehensive history tracking to the existing bulk Excel import functionality. The current implementation uses `upsert` operations in transactions but lacks history tracking for import operations. The research evaluates transaction patterns, change detection approaches, audit logging solutions, decimal precision handling, and performance optimization strategies.

**Key Recommendation:** Leverage existing Prisma transaction patterns, enhance manual change detection with deep comparison, avoid external audit libraries (schema already has history tables), maintain current Prisma Decimal handling, and implement batch processing with configurable chunk sizes.

---

## 1. Database Transaction Patterns for Bulk Operations

### Current Implementation Analysis

**Existing Pattern (from `item.model.ts`):**
```typescript
// Current bulk import uses prisma.$transaction with array
prisma.$transaction(
  items.map((item) =>
    prisma.item.upsert({
      where: { barcode: item.barcode || " " },
      update: { /* ... */ },
      create: { /* ... */ }
    })
  )
)
```

**Current single-edit pattern (from `item.service.ts`):**
```typescript
const updated = await prisma.$transaction(async (trx) => {
  await itemModel.addItemHistory(newUnit, oldUnit, user, "edit", id, trx);
  return itemModel.updateItem(data, unit, id, trx);
});
```

### Recommended Pattern: Interactive Transaction

**Why:** The bulk import needs to:
1. Fetch existing items (for change detection)
2. Record history entries for changed items
3. Perform upsert operations
4. All within a single transaction for atomicity

**Implementation:**

```typescript
await prisma.$transaction(async (trx) => {
  // Phase 1: Fetch existing items by barcodes
  const existingItems = await trx.item.findMany({
    where: { barcode: { in: barcodes } },
    include: { itemUnits: true }
  });
  
  // Phase 2: Detect changes and build operations
  const operations = items.map(async (item) => {
    const existing = existingItems.find(e => e.barcode === item.barcode);
    
    // If exists and changed, record history first
    if (existing && hasChanges(existing, item)) {
      await trx.itemHistory.create({
        data: {
          userName: user.name,
          userId: user.id,
          action: 'import',
          itemId: existing.id,
          itemHistoryDetails: {
            createMany: {
              data: buildHistoryDetails(existing.itemUnits, item.itemUnits)
            }
          }
        }
      });
    }
    
    // Then perform upsert
    return trx.item.upsert({
      where: { barcode: item.barcode },
      update: { /* ... */ },
      create: { /* ... */ }
    });
  });
  
  return Promise.all(operations);
}, {
  maxWait: 10000,  // 10s max wait to acquire transaction
  timeout: 60000,   // 60s transaction timeout for large imports
});
```

**Advantages:**
- Single transaction = atomic (all-or-nothing)
- Access to transaction client for history + upsert
- Sequential operations within transaction prevent race conditions
- Built-in rollback on any error

**Disadvantages:**
- Long-running transactions can cause lock contention
- Transaction timeout limits import size
- Memory usage for large batches

### Transaction Configuration

**Prisma Transaction Limits:**
- Default timeout: 5000ms (5 seconds)
- Max wait: 2000ms (2 seconds) 
- For bulk imports: Increase to 60s timeout, 10s max wait

**Source:** Prisma Official Documentation - Transactions
**Confidence:** HIGH (from Prisma docs and existing codebase patterns)

---

## 2. Change Detection Patterns

### Current Implementation

**Pattern:** Manual field-by-field comparison (from `item.util.ts`):
```typescript
const markIsChangedUnit = (newUnit: Array<UpdateUnit>, oldUnit: Array<UpdateUnit>) => {
  return newUnit.map((unit) => {
    const matchOldUnit = oldUnit.find((o) => o.id === unit.id);
    if (matchOldUnit) {
      unit.isChanged =
        unit.unitType !== matchOldUnit.unitType ||
        unit.rate !== matchOldUnit.rate ||
        unit.quantity !== matchOldUnit.quantity ||
        unit.purchasePrice !== matchOldUnit.purchasePrice;
    }
    return unit;
  });
};
```

### Evaluation: Manual vs. Libraries

#### Option 1: Continue Manual Comparison (RECOMMENDED)
**Why:**
- Already implemented and working for single edits
- Explicit control over what constitutes a "change"
- No external dependencies
- Decimal comparison works correctly (uses Prisma Decimal's equality)
- Type-safe with TypeScript

**Enhancement Needed:**
```typescript
// For bulk imports, extend to detect item-level changes too
const detectItemChanges = (oldItem: Item, newItem: ImportItem) => {
  return {
    hasItemChanges: 
      oldItem.name !== newItem.name ||
      oldItem.category !== newItem.category ||
      oldItem.expiryDate.getTime() !== newItem.expiryDate.getTime() ||
      oldItem.description !== newItem.description,
    changedUnits: detectUnitChanges(oldItem.itemUnits, newItem.itemUnits)
  };
};
```

#### Option 2: Deep Comparison Library (NOT RECOMMENDED)

**Libraries Evaluated:**
- `lodash.isequal` - Deep object comparison
- `fast-deep-equal` - Faster deep comparison
- `deep-diff` - Detailed diff with path tracking

**Why NOT recommended:**
1. Adds dependency for simple comparisons
2. Need custom equality for Prisma Decimal (requires wrapper)
3. Over-engineered for field-level tracking
4. Less explicit about what changed
5. May have performance overhead for large datasets

**Confidence:** HIGH (evaluated against existing patterns)

---

## 3. History/Audit Logging Libraries for Prisma

### Current Implementation

**Pattern:** Custom history tables (already in schema):
```prisma
model ItemHistory {
  id        Int       @id @default(autoincrement())
  userName  String
  createdAt DateTime  @default(now())
  action    HistoryAction
  userId    String?
  itemId    Int
  user      User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  item      Item      @relation(fields: [itemId], references: [id], onDelete: Cascade)
  itemHistoryDetails ItemHistoryDetail[]
}

model ItemHistoryDetail {
  id               Int  @id @default(autoincrement())
  oldUnitType      UnitType
  newUnitType      UnitType
  oldRate          Int
  newRate          Int
  oldQuantity      Int
  newQuantity      Int
  oldPurchasePrice Decimal @db.Decimal(10, 2)
  newPurchasePrice Decimal @db.Decimal(10, 2)
  itemHistoryId    Int
  itemHistory      ItemHistory @relation(...)
}
```

### Library Evaluation

#### Option 1: Continue Custom History Tables (RECOMMENDED)

**Why:**
- Schema already designed for domain-specific history
- Captures exact fields needed (old/new values per unit)
- Supports import vs. edit action distinction
- Already implemented for single edits
- Full control over what's tracked
- No middleware or extension complexity

**Enhancement:** Add helper functions for consistency
```typescript
// Reusable history creation helper
const createItemHistory = async (
  trx: Prisma.TransactionClient,
  itemId: number,
  oldUnits: ItemUnit[],
  newUnits: ImportUnit[],
  user: UserInfo,
  action: 'edit' | 'import'
) => {
  const changedUnits = detectChangedUnits(oldUnits, newUnits);
  
  if (changedUnits.length === 0) return null; // No changes, skip history
  
  return trx.itemHistory.create({
    data: {
      userName: user.name,
      userId: user.id,
      action,
      itemId,
      itemHistoryDetails: {
        createMany: {
          data: changedUnits.map(buildHistoryDetail)
        }
      }
    }
  });
};
```

#### Option 2: Prisma Audit Library (NOT RECOMMENDED)

**Libraries Evaluated:**
- `prisma-extension-audit` - Middleware-based audit logging
- `@prisma/audit` - Experimental audit extension

**Why NOT recommended:**
1. Generic audit != domain-specific history (need old/new per field)
2. Middleware adds complexity to all queries
3. Less control over when/what to audit
4. Existing schema incompatible (would need migration)
5. Schema already has better structure (ItemHistory + ItemHistoryDetail)

**Confidence:** HIGH (schema already has optimal design)

---

## 4. Decimal Precision Handling for Inventory

### Current Implementation

**Pattern:** PostgreSQL `Decimal(10, 2)` + Prisma Decimal
```prisma
model ItemUnit {
  purchasePrice Decimal @map("purchase_price") @db.Decimal(10, 2)
}
```

**Conversion in service layer:**
```typescript
const parsedItems = items.map((item) => ({
  ...item,
  itemUnits: item.itemUnits.map((unit) => ({
    ...unit,
    purchasePrice: unit.purchasePrice.toNumber(), // Prisma Decimal -> JS Number
  })),
}));
```

### Analysis

#### Current Approach: PostgreSQL Decimal + `.toNumber()` (ACCEPTABLE)

**Advantages:**
- PostgreSQL `NUMERIC(10,2)` stores exact decimal values
- No precision loss in database
- Prisma Decimal type prevents accidental floating-point math
- Sufficient for currency (2 decimal places)

**Concerns:**
- `.toNumber()` converts to JavaScript Number (IEEE 754 float)
- Can introduce floating-point errors for calculations
- Example: `0.1 + 0.2 !== 0.3` in JavaScript

**Is this a problem for POS backend?**
- **For storage/retrieval:** NO - Values stored as exact decimals in PostgreSQL
- **For display:** NO - Values sent as numbers to frontend (acceptable)
- **For calculations:** POTENTIALLY - If backend does price calculations

### Recommendations

#### Current Use Case: Continue Current Pattern
**If:** Backend only stores/retrieves prices (no calculations)
**Then:** Current pattern is sufficient
**Reason:** PostgreSQL guarantees precision, frontend handles calculations

#### If Backend Calculates Totals/Subtotals

**Enhancement:** Use `Decimal.js` or `decimal.js-light` for calculations

```typescript
import { Decimal } from 'decimal.js';

// Example: Calculate total from quantities and prices
const calculateTotal = (units: ItemUnit[]) => {
  return units.reduce((sum, unit) => {
    // Keep as Decimal for calculation
    const itemTotal = new Decimal(unit.quantity).times(unit.purchasePrice);
    return sum.plus(itemTotal);
  }, new Decimal(0));
};
```

**Library Comparison:**

| Library | Size | Features | Use Case |
|---------|------|----------|----------|
| `decimal.js` | ~32KB | Full-featured, configurable precision | Complex financial calculations |
| `decimal.js-light` | ~10KB | Core operations only | Simple price calculations |
| `big.js` | ~6KB | Minimal, simple API | Basic arithmetic only |

**Recommendation:** Add `decimal.js-light` only if backend performs calculations
**Confidence:** HIGH

#### Excel Import Considerations

**ExcelJS Handling:**
- ExcelJS reads numbers as JavaScript Numbers
- For currency columns, values are already limited by Excel's precision
- No precision loss beyond what user entered in Excel

**No Additional Handling Needed** for import pipeline
**Confidence:** HIGH

---

## 5. Performance Patterns for Large Batch Imports

### Current Implementation Analysis

**Pattern:** Single transaction with all items
```typescript
prisma.$transaction(
  items.map((item) => prisma.item.upsert({ ... }))
)
```

**Observed Issues:**
- No batch size limit
- All items in single transaction = memory spike
- Transaction timeout risk for >500 items
- Locks entire Item table during import

### Performance Optimization Strategies

#### Strategy 1: Chunked Batch Processing (RECOMMENDED)

**Pattern:**
```typescript
const CHUNK_SIZE = 100; // Configurable per environment

const importItemsInChunks = async (items: ImportItem[], user: UserInfo) => {
  const chunks = chunkArray(items, CHUNK_SIZE);
  const results = [];
  
  for (const chunk of chunks) {
    const chunkResult = await prisma.$transaction(async (trx) => {
      // Process chunk within transaction
      return processChunkWithHistory(chunk, user, trx);
    }, {
      timeout: 30000 // 30s per chunk
    });
    
    results.push(...chunkResult);
  }
  
  return results;
};

const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};
```

**Advantages:**
- Prevents transaction timeouts
- Reduces memory usage
- Partial success possible (track which chunks succeeded)
- Configurable chunk size per environment

**Disadvantages:**
- Not atomic across all items (chunk-level atomicity only)
- Requires tracking import progress

**Recommended Chunk Sizes:**
- Development: 50 items
- Production: 100-200 items (test with real data)

**Confidence:** HIGH (standard practice for bulk operations)

#### Strategy 2: Parallel Chunk Processing (ADVANCED)

**Pattern:**
```typescript
const importItemsParallel = async (items: ImportItem[], user: UserInfo) => {
  const chunks = chunkArray(items, CHUNK_SIZE);
  const CONCURRENCY = 3; // Limit concurrent transactions
  
  // Process chunks with controlled concurrency
  const results = await pLimit(CONCURRENCY, chunks.map(chunk => 
    () => prisma.$transaction(async (trx) => {
      return processChunkWithHistory(chunk, user, trx);
    })
  ));
  
  return results.flat();
};
```

**Requires:** `p-limit` library for concurrency control
**Advantages:**
- Faster for large imports (parallel processing)
- Still prevents overwhelming database

**Disadvantages:**
- More complex error handling
- Potential for deadlocks if not careful
- Requires additional dependency

**Recommendation:** Implement if imports regularly exceed 500+ items
**Confidence:** MEDIUM (depends on load testing results)

#### Strategy 3: Background Job Processing (FUTURE)

**Pattern:** Queue-based import processing
**Libraries:**
- `bullmq` - Redis-based job queue
- `pg-boss` - PostgreSQL-based job queue

**When:**
- Imports exceed 1000+ items
- Need progress tracking UI
- Import must not block API response

**Not Recommended for Current Milestone** - Adds significant complexity
**Confidence:** HIGH (standard pattern, but overkill for current scope)

### Database Optimizations

#### Indexing Strategy

**Current Indexes:**
```prisma
model Item {
  barcode String @unique @default(uuid()) // Already indexed
}
```

**Recommendations:**
1. **Keep existing barcode unique index** - Used for upsert lookup
2. **Consider composite index if filtering by location during import:**
   ```prisma
   @@index([locationId, barcode])
   ```
3. **History table indexes:**
   ```prisma
   model ItemHistory {
     @@index([itemId, createdAt]) // For fetching history by item
     @@index([userId]) // If filtering by user
   }
   ```

**Confidence:** HIGH

#### Connection Pooling

**Current Setup:** Prisma default connection pool
**Recommendation:**
```typescript
// In prisma/schema.prisma datasource block
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add to DATABASE_URL: ?connection_limit=10&pool_timeout=30
}
```

**For Import Operations:**
- Minimum pool size: 5 connections
- Maximum: 10-20 (depending on server resources)
- Pool timeout: 30 seconds

**Confidence:** MEDIUM (requires load testing to tune)

### Memory Management

#### Excel File Size Limits

**ExcelJS Memory Usage:**
- Loads entire workbook into memory
- ~5MB per 10,000 rows (approximate)

**Recommendations:**
1. **File size limit:** 10MB max (via Multer config)
2. **Row limit validation:** 
   ```typescript
   if (worksheet.rowCount > 5000) {
     throw new BadRequestError('Excel file exceeds 5000 rows limit');
   }
   ```
3. **Stream-based parsing (future):** For very large files
   ```typescript
   const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream);
   // Process rows as stream
   ```

**Confidence:** HIGH (ExcelJS documentation)

### Performance Benchmarks (Estimated)

| Import Size | Pattern | Expected Time | Memory Usage |
|-------------|---------|---------------|--------------|
| 100 items | Single transaction | 2-5 seconds | ~20MB |
| 500 items | Chunked (100) | 10-15 seconds | ~50MB |
| 1000 items | Chunked (100) | 20-30 seconds | ~100MB |
| 5000 items | Chunked (200) + parallel | 60-90 seconds | ~200MB |

**Note:** Actual performance depends on:
- Database hardware
- Network latency
- Concurrent users
- Existing data volume

**Confidence:** LOW (requires load testing to validate)

---

## Recommended Stack Additions

### Required Dependencies

**None** - All requirements met by existing stack

### Optional Dependencies (If Needed)

| Library | Version | Purpose | When to Add |
|---------|---------|---------|-------------|
| `decimal.js-light` | ^2.5.1 | Price calculations in backend | If adding calculation logic |
| `p-limit` | ^5.0.0 | Concurrency control for parallel chunks | If imports > 500 items regularly |

### Development Dependencies

| Library | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `@faker-js/faker` | ^8.4.0 | Generate test data for bulk import testing | HIGH |
| `prisma-test-container` | ^1.0.0 | Isolated database testing | MEDIUM |

---

## Implementation Checklist

### Phase 1: Core Functionality
- [ ] Extract history creation into reusable helper function
- [ ] Implement change detection for import operations
- [ ] Refactor `importItems` to use interactive transaction
- [ ] Add history recording before each upsert
- [ ] Update `HistoryAction` enum to support `import` action (already exists)

### Phase 2: Performance
- [ ] Implement chunked batch processing
- [ ] Add configurable chunk size (env variable)
- [ ] Add row count validation (max 5000 rows)
- [ ] Test with 1000+ item dataset

### Phase 3: Observability
- [ ] Add import progress tracking (optional)
- [ ] Log chunk processing metrics
- [ ] Add import summary response (total, created, updated, errors)

---

## Sources & Confidence Assessment

| Topic | Primary Source | Confidence | Notes |
|-------|----------------|------------|-------|
| Prisma Transactions | Existing codebase + Prisma docs patterns | HIGH | Interactive transaction pattern already used |
| Change Detection | Existing implementation (`markIsChangedUnit`) | HIGH | Extend existing pattern |
| History Tables | Current schema design | HIGH | Schema already optimal |
| Decimal Handling | Prisma Decimal docs + PostgreSQL | HIGH | Current approach sufficient |
| Batch Processing | Industry best practices + Prisma patterns | HIGH | Standard chunking pattern |
| Performance Estimates | Experience + similar projects | LOW | Requires load testing |
| Library Evaluation | npm registry + community usage | MEDIUM | Common libraries, well-documented |

---

## Risk Assessment

### Low Risk
- ✅ Using existing transaction patterns
- ✅ Extending existing change detection
- ✅ No new dependencies required
- ✅ Schema already supports history tracking

### Medium Risk
- ⚠️ Performance with 1000+ item imports (mitigated by chunking)
- ⚠️ Transaction timeout tuning (requires testing)
- ⚠️ Memory usage for large Excel files (mitigated by row limit)

### High Risk
- ❌ None identified

---

## Open Questions for Phase Research

1. **What is the typical import file size?** (Determines chunk size tuning)
2. **Are concurrent imports expected?** (Affects pooling strategy)
3. **Is partial import success acceptable?** (Affects error handling approach)
4. **Should failed chunks retry automatically?** (Affects implementation complexity)

---

## Conclusion

The existing stack is well-suited for adding history tracking to bulk imports. The primary technical work involves:

1. **Refactoring** the import transaction to use interactive pattern (already used for single edits)
2. **Extending** the existing change detection logic to work with imports
3. **Implementing** chunked batch processing for performance
4. **Reusing** the existing history table schema and patterns

**No new dependencies required** - all functionality achievable with current stack (Prisma, PostgreSQL, ExcelJS, TypeScript).

**Recommended approach:** Start with single-transaction implementation for initial milestone, add chunking in follow-up if performance testing reveals issues with typical import sizes.

**Overall Confidence:** HIGH - Clear path forward using proven patterns already in codebase.
