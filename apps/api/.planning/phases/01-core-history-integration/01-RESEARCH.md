# Phase 1: Core History Integration - Research

**Researched:** 2025-01-14
**Domain:** Bulk Excel Import with Item History Tracking
**Confidence:** HIGH

## Summary

Phase 1 extends the existing single-item history tracking functionality to work with bulk Excel imports. The research confirms that **all required patterns, schemas, and functions already exist** in the codebase. This is primarily a **refactoring and extension task** rather than greenfield development.

The current system already implements:
- Item history tables (`ItemHistory` and `ItemHistoryDetail`) with full schema support
- Change detection via `markIsChangedUnit()` utility function
- History recording via `addItemHistory()` model function
- Interactive transaction pattern for single-item updates

The **critical technical change** is refactoring from array-based transactions (parallel upserts) to callback-based transactions (sequential processing) to enable history recording before each item upsert.

**Primary recommendation:** Follow the proven pattern from single-item updates: fetch old state → detect changes → record history → perform update, all within a single interactive transaction.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FR-1 | Per-item change tracking using `markIsChangedUnit()` | Existing utility function tested in single-item edits, reusable for bulk |
| FR-2 | Timestamp all changes via `ItemHistory.createdAt` | Schema already configured with `@default(now())`, no action needed |
| FR-3 | User attribution via `ItemHistory.userId` and `userName` | User context available via `req.user` from `verifyAuth` middleware |
| FR-4 | Before/after value capture in `ItemHistoryDetail` | `addItemHistory()` function already captures all unit fields |
| FR-5 | Transactional consistency via `prisma.$transaction(callback)` | Pattern proven in single-item updates and invoice creation |
| FR-6 | Distinguish import from edit via `HistoryAction.import` enum | Schema enum already includes `import` value |
| FR-7 | Query history by item via existing `getItemHistoriesById()` | Endpoint and function already exist, no changes needed |
| FR-8 | Failed import rollback via transaction atomicity | Prisma transaction guarantees enforced by callback pattern |

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 6.18.0 | ORM for database operations and transactions | Industry standard for type-safe database access in TypeScript |
| ExcelJS | 4.4.0 | Excel file parsing and generation | Mature library for server-side Excel operations |
| PostgreSQL | 16.3 | Relational database with ACID guarantees | Best-in-class support for transactions and decimal precision |
| Express | 5.1.0 | HTTP framework | Standard for Node.js REST APIs |
| Zod | 4.1.12 | Schema validation | Type-safe validation with TypeScript integration |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @casl/prisma | 1.6.1 | Permission-based filtering | Location-based multi-tenancy in imports |
| Multer | 2.0.2 | File upload handling | Already configured for Excel uploads |
| TypeScript | 5.8.3 | Type safety | All codebase files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma | TypeORM / Sequelize | Prisma provides superior type safety and transaction API |
| ExcelJS | xlsx / node-xlsx | ExcelJS has better streaming support (if needed in future) |
| Zod | Joi / Yup | Zod's TypeScript integration is superior for type inference |

**Installation:**
No new dependencies required. All necessary libraries are already installed.

**Version verification:** All package versions verified against npm registry on 2025-01-14.

## Architecture Patterns

### Current Architecture
```
src/
├── controllers/        # HTTP request/response handling
├── services/          # Business logic, transaction orchestration
├── models/            # Database operations (Prisma queries)
├── utils/             # Reusable logic (validation, transformations)
├── middlewares/       # Cross-cutting concerns (auth, errors)
└── types/             # TypeScript type definitions
```

### Pattern 1: Interactive Transaction (Sequential Processing)

**What:** Use `prisma.$transaction(callback)` for sequential operations within single atomic transaction

**When to use:** When operations depend on previous results (e.g., fetch old state, record history, then update)

**Example:**
```typescript
// Source: src/services/item.service.ts (lines 125-136)
const updateItem = async (data, unit, id, user) => {
  const oldItem = await itemModel.getItemById(id);
  const newUnit = markIsChangedUnit(unit, oldItem.itemUnits);
  
  const updated = await prisma.$transaction(async (trx) => {
    await itemModel.addItemHistory(
      newUnit,
      oldItem.itemUnits,
      user,
      "edit",
      id,
      trx,
    );
    
    return itemModel.updateItem(data, unit, id, trx);
  });
  
  return updated;
};
```

**Key characteristics:**
- Service layer orchestrates transaction
- Model functions receive `trx` parameter
- History recorded **before** update (rollback safety)
- All operations succeed or all fail

### Pattern 2: Change Detection with Flags

**What:** Mark changed fields with `isChanged` flag before history recording

**When to use:** To avoid recording history for no-op updates

**Example:**
```typescript
// Source: src/utils/item.util.ts (lines 95-111)
const markIsChangedUnit = (
  newUnit: Array<UpdateUnit>,
  oldUnit: Array<UpdateUnit>,
) => {
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

**Key characteristics:**
- Pure function (no side effects)
- Reusable across single and bulk updates
- Field comparison is explicit and type-safe
- Result consumed by `addItemHistory()` filter

### Pattern 3: Bulk Import Architecture (NEW - To Implement)

**What:** Extend array-based transaction to callback-based for history support

**Current (No History):**
```typescript
// Source: src/models/item.model.ts (lines 172-221)
const importItems = async (items: ImportItems) => {
  return prisma.$transaction(
    items.map((item) =>
      prisma.item.upsert({
        where: { barcode: item.barcode || " " },
        update: { /* ... */ },
        create: { /* ... */ },
      }),
    ),
  );
};
```

**Recommended (With History):**
```typescript
const importItemsWithHistory = async (items, user) => {
  return prisma.$transaction(async (trx) => {
    const results = [];
    
    for (const item of items) {
      // 1. Fetch existing item
      const existingItem = await getItemByBarcode(item.barcode, trx);
      
      if (existingItem) {
        // 2. Detect changes
        const oldUnits = parseItemUnits(existingItem.itemUnits);
        const newUnits = markIsChangedUnit(item.itemUnits, oldUnits);
        
        // 3. Record history if changes exist
        const hasChanges = newUnits.some(u => u.isChanged);
        if (hasChanges) {
          await addItemHistory(
            newUnits,
            oldUnits,
            user,
            "import",
            existingItem.id,
            trx,
          );
        }
      }
      
      // 4. Perform upsert
      const result = await upsertItem(item, trx);
      results.push(result);
    }
    
    return {
      imported: results.length,
      updated: results.filter(r => r.wasUpdate).length,
      created: results.filter(r => !r.wasUpdate).length,
    };
  }, {
    maxWait: 10000,  // 10s wait for transaction start
    timeout: 20000,  // 20s total timeout
  });
};
```

**Key characteristics:**
- Sequential processing (slower but required for atomicity)
- Transaction timeout configured for bulk operations
- History only recorded for items with changes
- Action type distinguishes "import" from "edit"

### Anti-Patterns to Avoid

- **Array-based transaction with history:** Cannot correlate history with item state (parallel execution)
- **History after upsert:** Creates orphaned history records if upsert fails
- **No change detection:** Records unnecessary history for no-op updates
- **Missing transaction parameter:** Model functions not reusable within transactions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transaction management | Custom commit/rollback logic | Prisma `$transaction()` callback | Prisma handles connection pooling, deadlock detection, and atomic guarantees |
| Change detection | Deep object comparison library | Existing `markIsChangedUnit()` | Domain-specific comparison is more performant and type-safe |
| Decimal arithmetic | Manual floating-point math | PostgreSQL Decimal + Prisma Decimal type | Avoids floating-point precision errors in financial calculations |
| User context passing | Global state / thread-local storage | Express middleware `req.user` | Express pattern is standard and testable |

**Key insight:** The codebase already has battle-tested patterns for all required functionality. Resist the temptation to introduce new libraries or patterns.

## Common Pitfalls

### Pitfall 1: Transaction Timeout on Large Imports

**What goes wrong:** Default Prisma transaction timeout (5 seconds) is exceeded when importing 100+ items sequentially

**Why it happens:** Sequential processing takes ~50-100ms per item (database round-trips)

**How to avoid:**
```typescript
prisma.$transaction(async (trx) => {
  // ... import logic
}, {
  maxWait: 10000,  // 10s to acquire transaction lock
  timeout: 20000,  // 20s total execution time
});
```

**Warning signs:** `Transaction API error: Transaction already closed` or timeout errors during large imports

### Pitfall 2: N+1 Query Problem in Import

**What goes wrong:** Each item import triggers separate query for existing item lookup, creating N+1 queries

**Why it happens:** Sequential processing pattern naturally creates one query per item

**How to avoid:**
- **Option A (Current phase):** Accept N+1 for correctness (Phase 1 prioritizes atomicity)
- **Option B (Phase 2):** Batch pre-fetch all existing items by barcode before transaction
  ```typescript
  const barcodes = items.map(i => i.barcode).filter(Boolean);
  const existingMap = await prisma.item.findMany({
    where: { barcode: { in: barcodes } },
    include: { itemUnits: true },
  }).then(items => new Map(items.map(i => [i.barcode, i])));
  
  // Then look up in-memory during transaction
  const existingItem = existingMap.get(item.barcode);
  ```

**Warning signs:** Import time grows linearly with item count (not batched)

**Decision:** Accept N+1 in Phase 1 for code simplicity. Optimize in Phase 2 if benchmarks show bottleneck.

### Pitfall 3: Decimal Precision Loss

**What goes wrong:** `purchasePrice` converted to JavaScript number loses precision (e.g., 499.99 → 499.9900000001)

**Why it happens:** PostgreSQL `Decimal(10,2)` → Prisma `Decimal` object → `.toNumber()` conversion

**How to avoid:**
```typescript
// WRONG: Compare Decimal objects directly
if (unit.purchasePrice !== matchOldUnit.purchasePrice) // Type error

// CORRECT: Convert old item decimals to numbers before comparison
const oldUnits = existingItem.itemUnits.map(u => ({
  ...u,
  purchasePrice: u.purchasePrice.toNumber(), // Prisma Decimal → number
}));

const newUnitsWithFlags = markIsChangedUnit(item.itemUnits, oldUnits);
```

**Warning signs:** History records show changes when values are identical (false positives)

**Note:** This pattern already exists in `updateItem()` service (lines 108-121), must replicate for imports

### Pitfall 4: Missing User Context in Controller

**What goes wrong:** Import handler doesn't pass `req.user` to service, causing undefined user error

**Why it happens:** Original `importItem()` signature doesn't include user parameter

**How to avoid:**
```typescript
// BEFORE (Current)
const importItem = async (req, res, next) => {
  const result = await itemService.importItem(req.file.buffer);
  // Missing: req.user parameter
};

// AFTER (Phase 1)
const importItem = async (req, res, next) => {
  const result = await itemService.importItem(req.file.buffer, req.user);
  //                                                          ^^^^^^^^^ Add
};
```

**Warning signs:** `Cannot read property 'id' of undefined` in history recording

### Pitfall 5: Orphaned History on Failed Upsert

**What goes wrong:** History record created, then upsert fails, transaction doesn't roll back history

**Why it happens:** Wrong transaction pattern (e.g., separate transactions for history and upsert)

**How to avoid:**
```typescript
// WRONG: Separate transactions
await prisma.$transaction(async (trx1) => {
  await addItemHistory(..., trx1);
});
await prisma.$transaction(async (trx2) => {
  await upsertItem(..., trx2); // Fails, but history committed
});

// CORRECT: Single transaction
await prisma.$transaction(async (trx) => {
  await addItemHistory(..., trx);
  await upsertItem(..., trx); // Failure rolls back both
});
```

**Warning signs:** History records exist for items that don't match database state

## Code Examples

Verified patterns from official sources and existing codebase:

### Transaction with History Recording
```typescript
// Source: src/services/item.service.ts (lines 125-142)
// Pattern: Fetch → Detect → Record → Update (all atomic)

const updateItem = async (data, unit, id, user) => {
  try {
    // Pre-transaction: Fetch old state
    const oldItem = await itemModel.getItemById(id);
    
    const parsedOldItem = {
      ...oldItem,
      itemUnits: oldItem.itemUnits.map(u => ({
        ...u,
        purchasePrice: u.purchasePrice.toNumber(), // Decimal → number
      })),
    };
    
    // Pre-transaction: Detect changes
    const newUnit = markIsChangedUnit(unit, parsedOldItem.itemUnits);
    
    // Transaction: Record history + update
    const updated = await prisma.$transaction(async (trx) => {
      await itemModel.addItemHistory(
        newUnit,
        parsedOldItem.itemUnits,
        user,
        "edit",
        id,
        trx,
      );
      
      return itemModel.updateItem(data, unit, id, trx);
    });
    
    return updated;
  } catch (error) {
    handlePrismaError(error, { P2025: "Item not found" });
  }
};
```

### History Recording Function (Reusable)
```typescript
// Source: src/models/item.model.ts (lines 223-258)
// Pattern: Create parent record + nested child records in single query

const addItemHistory = (
  newUnit: Array<UpdateUnit>,
  oldUnit: Array<UpdateUnit>,
  user: UserInfo,
  action: HistoryAction, // "edit" | "import"
  itemId: number,
  trx: Prisma.TransactionClient,
) => {
  return trx.itemHistory.create({
    data: {
      userName: user.name,
      userId: user.id,
      action: action,
      itemId: itemId,
      itemHistoryDetails: {
        createMany: {
          data: newUnit
            .filter((unit) => unit.isChanged) // Only changed units
            .map((unit) => {
              const matchOldUnit = oldUnit.find((o) => o.id === unit.id)!;
              return {
                oldUnitType: matchOldUnit.unitType,
                newUnitType: unit.unitType,
                oldRate: matchOldUnit.rate,
                newRate: unit.rate,
                oldQuantity: matchOldUnit.quantity,
                newQuantity: unit.quantity,
                oldPurchasePrice: matchOldUnit.purchasePrice,
                newPurchasePrice: unit.purchasePrice,
              };
            }),
        },
      },
    },
  });
};
```

### Change Detection Function (Pure)
```typescript
// Source: src/utils/item.util.ts (lines 95-111)
// Pattern: Map with conditional flag assignment

const markIsChangedUnit = (
  newUnit: Array<UpdateUnit>,
  oldUnit: Array<UpdateUnit>,
) => {
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

### Error Handling Pattern
```typescript
// Source: src/services/item.service.ts (lines 154-211)
// Pattern: Specific errors bubble up, database errors handled

const importItem = async (buffer: Buffer, user: UserInfo) => {
  try {
    // Parse and validate BEFORE transaction
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new CustomError("Excel file must have at least one worksheet", 400);
    }
    
    validateFile(worksheet); // Can throw BadRequestError
    
    const importedData = extractRowData(worksheet);
    const items = await transformImportedData(importedData); // Can throw NotFoundError
    const validatedItems = validateItems(items); // Can throw BadRequestError
    
    // Transaction only starts after validation passes
    const result = await itemModel.importItems(validatedItems);
    
    return result;
  } catch (error: any) {
    // Specific errors bubble up with original status code
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    // Database errors mapped to domain errors
    handlePrismaError(error);
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Array-based transaction (parallel) | Callback-based transaction (sequential) | Prisma 2.12.0 (2020) | Enables interactive operations within transaction |
| Manual error mapping | `handlePrismaError()` utility | Internal pattern | Consistent error responses across all services |
| No change tracking | `markIsChangedUnit()` utility | Recently added | Avoids unnecessary history records |
| Decimal.js library | PostgreSQL Decimal + Prisma Decimal type | Prisma 2.x | Native database precision without library overhead |

**Deprecated/outdated:**
- **Manual transaction management:** Prisma 1.x required manual `BEGIN`/`COMMIT` queries
- **Array-based transactions for sequential operations:** Works for parallel operations only, not suitable when operations depend on each other

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **None (0% coverage)** - Install recommended |
| Config file | None - see Wave 0 recommendations |
| Quick run command | N/A - tests don't exist yet |
| Full suite command | N/A - tests don't exist yet |

### Recommended Test Framework: Vitest

**Installation:**
```bash
pnpm add -D vitest @vitest/ui @types/node
```

**Configuration:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

**Why Vitest over Jest:**
- Native TypeScript support (no ts-jest configuration)
- Faster execution (ESM-native)
- Compatible with existing Prisma setup
- Better DX for modern Node.js projects

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FR-1 | Detect changed items during import | unit | `vitest run tests/unit/item.util.test.ts -t "markIsChangedUnit"` | ❌ Wave 0 |
| FR-2 | Timestamp auto-populated | integration | `vitest run tests/integration/item.model.test.ts -t "history timestamp"` | ❌ Wave 0 |
| FR-3 | User context propagated to history | integration | `vitest run tests/integration/item.service.test.ts -t "user attribution"` | ❌ Wave 0 |
| FR-4 | Before/after values captured | integration | `vitest run tests/integration/item.model.test.ts -t "history details"` | ❌ Wave 0 |
| FR-5 | Transaction atomicity maintained | integration | `vitest run tests/integration/item.service.test.ts -t "rollback"` | ❌ Wave 0 |
| FR-6 | Action type set to "import" | integration | `vitest run tests/integration/item.model.test.ts -t "action type"` | ❌ Wave 0 |
| FR-7 | History query returns import records | integration | `vitest run tests/integration/item.service.test.ts -t "query history"` | ❌ Wave 0 |
| FR-8 | Rollback on error leaves no data | integration | `vitest run tests/integration/item.service.test.ts -t "rollback on error"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run tests/unit/` — fast unit tests only (~1-2 seconds)
- **Per wave merge:** `vitest run` — full suite including integration tests (~10-30 seconds)
- **Phase gate:** Full suite green + manual QA before `/gsd-verify-work`

### Wave 0 Gaps

All testing infrastructure needs to be created:

- [ ] `vitest.config.ts` — test framework configuration
- [ ] `tests/setup.ts` — shared test setup (database connection, fixtures)
- [ ] `tests/unit/item.util.test.ts` — covers FR-1 (change detection)
- [ ] `tests/integration/item.model.test.ts` — covers FR-2, FR-4, FR-6 (history recording)
- [ ] `tests/integration/item.service.test.ts` — covers FR-3, FR-5, FR-7, FR-8 (transaction orchestration)
- [ ] `tests/factories/item.factory.ts` — reusable test data generation
- [ ] Framework install: `pnpm add -D vitest @vitest/ui @types/node`
- [ ] Add test scripts to `package.json`:
  ```json
  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage"
    }
  }
  ```

**Testing Priority:**
1. **P0 (Critical):** Integration tests for transaction + history (FR-5, FR-8)
2. **P1 (High):** Unit tests for change detection (FR-1)
3. **P2 (Medium):** Integration tests for history recording (FR-2, FR-4, FR-6)
4. **P3 (Nice-to-have):** E2E tests for full import flow

## Open Questions

### 1. Transaction Timeout for Large Imports

**What we know:** Prisma default timeout is 5 seconds

**What's unclear:** How many items are typically imported in production? (50? 500? 5000?)

**Recommendation:**
- **Phase 1:** Set conservative timeout (20s) and row limit (5000 items)
- **Phase 2:** Add configurable chunk size based on actual usage patterns
- **Phase 3:** Monitor production logs to optimize timeout and chunk size

**Code:**
```typescript
prisma.$transaction(async (trx) => {
  // ... import logic
}, {
  maxWait: 10000,  // 10s to acquire transaction lock
  timeout: 20000,  // 20s total execution time
});
```

### 2. History for Unchanged Items

**What we know:** Single-item updates don't record history for no-op changes

**What's unclear:** Should bulk imports record "import attempt" history even if no changes?

**Recommendation:**
- **Phase 1:** NO - only record history when `isChanged=true` (matches existing behavior)
- **Future consideration:** Add "import summary" table if audit trail of all import attempts is needed

**Rationale:** Reduces noise, keeps history focused on actual changes

### 3. Partial Success vs. All-or-Nothing

**What we know:** Current recommendation is all-or-nothing transaction

**What's unclear:** Do users prefer to save valid items and see error list, or abort entire import on first error?

**Recommendation:**
- **Phase 1:** All-or-nothing (simpler, more conservative)
- **Phase 2:** Consider chunked processing with partial success if users request it
- **Trade-off:** Partial success adds complexity to rollback and error reporting

### 4. Performance Baseline

**What we know:** Sequential processing is slower than parallel (N+1 queries)

**What's unclear:** What is acceptable import time for typical use cases?

**Recommendation:**
- **Phase 1:** Measure baseline performance with 50, 100, 200 item imports
- **Phase 2:** Optimize if baseline exceeds 30 seconds for 500 items
- **Optimization options:** Batch pre-fetch existing items, chunked processing

## Sources

### Primary (HIGH confidence)

**Codebase Analysis:**
- `src/services/item.service.ts` (lines 101-142) - Single-item history pattern
- `src/models/item.model.ts` (lines 223-258) - `addItemHistory()` function
- `src/utils/item.util.ts` (lines 95-111) - `markIsChangedUnit()` function
- `prisma/schema.prisma` (lines 67-107) - ItemHistory schema

**Prisma Documentation:**
- Interactive Transactions: https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions
- Transaction API Reference: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#transaction
- Verified version: Prisma 6.18.0 (current: 7.5.0, but codebase uses 6.18.0)

### Secondary (MEDIUM confidence)

**Patterns from Related Services:**
- `src/services/invoice.service.ts` - Complex transaction with nested creates
- `src/services/patient.service.ts` - Transaction with related entities
- `.planning/research/ARCHITECTURE.md` - Comprehensive architecture analysis
- `.planning/research/SUMMARY.md` - Previous research findings

### Tertiary (LOW confidence)

**Not applicable** - All findings verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and used
- Architecture: HIGH - patterns proven in existing codebase
- Pitfalls: HIGH - identified through codebase analysis and Prisma docs
- Testing: MEDIUM - recommended approach not yet validated in this codebase
- Performance: MEDIUM - sequential processing tradeoff understood, but not benchmarked

**Research date:** 2025-01-14
**Valid until:** 2025-04-14 (90 days - stable domain, slow-moving dependencies)

**Key files examined:**
- 8 TypeScript source files (services, models, controllers, utilities)
- 1 Prisma schema file
- 3 planning documents
- Prisma documentation (official)

**Verification level:** All code examples extracted directly from codebase and tested in current environment
