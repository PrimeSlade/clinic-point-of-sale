# Architecture Patterns: Bulk Import with History Tracking

**Project:** Point-Of-Sale Backend - Item History for Bulk Imports
**Context:** Subsequent milestone - Extending existing layered MVC architecture
**Researched:** 2025-03-19

## Executive Summary

Integrating history tracking into bulk Excel imports requires careful orchestration across the existing layered architecture. The current codebase already implements:
- Single-item history tracking via `addItemHistory()` in `item.model.ts`
- Change detection via `markIsChangedUnit()` in `item.util.ts`
- Transactional integrity for update operations

The bulk import flow currently uses `prisma.$transaction(array)` with mapped upsert operations but lacks history recording. The integration must maintain atomicity (import + history) while respecting existing layer boundaries and patterns.

**Key Finding:** The current `importItems()` function uses **array-based transactions** (parallel upserts) which cannot support sequential history recording. Must refactor to **callback-based transaction** pattern for sequential operations.

---

## Current Architecture Analysis

### Existing Layer Responsibilities

| Layer | Current Role | Files |
|-------|-------------|-------|
| **Route** | HTTP endpoint, file upload handling | `src/routes/v1/item.route.ts` |
| **Controller** | Request/response orchestration, basic validation | `src/controllers/item.controller.ts` |
| **Service** | Business logic, data transformation, transaction orchestration | `src/services/item.service.ts` |
| **Model** | Database operations (Prisma queries) | `src/models/item.model.ts` |
| **Utility** | Reusable logic (Excel parsing, validation, change detection) | `src/utils/item.util.ts`, `src/utils/validation.ts` |

### Current History Tracking Pattern (Single Item)

**File:** `src/services/item.service.ts` (lines 101-142)

```typescript
const updateItem = async (data, unit, id, user) => {
  // 1. Service Layer: Fetch old state
  const oldItem = await itemModel.getItemById(id);
  
  // 2. Service Layer: Detect changes (business logic)
  const newUnit = markIsChangedUnit(unit, oldItem.itemUnits);
  
  // 3. Service Layer: Orchestrate transaction
  const updated = await prisma.$transaction(async (trx) => {
    // 4. Model Layer: Record history BEFORE update
    await itemModel.addItemHistory(
      newUnit,
      oldItem.itemUnits,
      user,
      "edit",
      id,
      trx,
    );
    
    // 5. Model Layer: Perform update
    return itemModel.updateItem(data, unit, id, trx);
  });
  
  return updated;
};
```

**Pattern Observations:**
- ✅ Transaction orchestration lives in **service layer**
- ✅ Change detection (`markIsChangedUnit`) is **service-layer business logic**
- ✅ Model functions accept `trx` parameter for transaction participation
- ✅ History recorded **before** actual update (enables rollback if update fails)
- ✅ Callback-based transaction for sequential operations

---

## Recommended Architecture for Bulk Import with History

### Component Boundaries and Responsibilities

#### 1. Controller Layer (`item.controller.ts`)
**Responsibility:** HTTP concerns only

```typescript
const importItem = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }
    
    // Pass user context for history attribution
    const result = await itemService.importItem(req.file.buffer, req.user);
    
    sendResponse(res, 201, "Items imported successfully", result);
  } catch (error) {
    next(error);
  }
};
```

**Changes from current:** Add `req.user` parameter (already available via `verifyAuth` middleware)

---

#### 2. Service Layer (`item.service.ts`)
**Responsibility:** Business logic orchestration, transaction management

```typescript
const importItem = async (buffer: Buffer, user: UserInfo) => {
  try {
    // Step 1: Parse Excel (utility function - existing)
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) {
      throw new CustomError("Excel file must have at least one worksheet", 400);
    }
    
    // Step 2: Validate file structure (utility function - existing)
    validateFile(worksheet);
    
    // Step 3: Extract raw data (utility function - existing)
    const importedData = extractRowData(worksheet);
    
    // Step 4: Transform and validate (utility function - existing)
    const items = await transformImportedData(importedData);
    const validatedItems = validateItems(items);
    
    // Step 5: Orchestrate import with history (NEW)
    const result = await importItemsWithHistory(validatedItems, user);
    
    return result;
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

// NEW: Extract transaction orchestration into separate function
const importItemsWithHistory = async (
  items: ImportItems,
  user: UserInfo,
) => {
  // Use callback-based transaction for sequential operations
  return prisma.$transaction(async (trx) => {
    const results = [];
    
    // Process each item sequentially to record history
    for (const item of items) {
      // 1. Check if item exists (for upsert logic)
      const existingItem = await itemModel.getItemByBarcode(
        item.barcode || "",
        trx,
      );
      
      if (existingItem) {
        // UPDATE path: detect changes and record history
        const oldUnits = existingItem.itemUnits.map((u) => ({
          id: u.id,
          unitType: u.unitType,
          rate: u.rate,
          quantity: u.quantity,
          purchasePrice: u.purchasePrice.toNumber(),
        }));
        
        // Mark changed units (reuse existing utility)
        const newUnitsWithChangeFlag = markIsChangedUnit(item.itemUnits, oldUnits);
        
        // Only record history if there are actual changes
        const hasChanges = newUnitsWithChangeFlag.some((u) => u.isChanged);
        
        if (hasChanges) {
          await itemModel.addItemHistory(
            newUnitsWithChangeFlag,
            oldUnits,
            user,
            "import", // Use "import" action to distinguish from manual edits
            existingItem.id,
            trx,
          );
        }
      }
      // CREATE path: no history needed for new items
      
      // 2. Perform upsert
      const result = await itemModel.upsertItem(item, trx);
      results.push(result);
    }
    
    return {
      imported: results.length,
      updated: results.filter((r) => r.wasUpdate).length,
      created: results.filter((r) => !r.wasUpdate).length,
    };
  });
};
```

**Key Decisions:**
- ✅ **Sequential processing** instead of parallel: Required for history correlation
- ✅ **Transaction orchestration in service layer**: Matches existing pattern
- ✅ **Reuse `markIsChangedUnit()`**: Consistent change detection logic
- ✅ **History recorded before upsert**: Rollback safety
- ✅ **Action = "import"**: Distinguishes bulk imports from manual edits in audit trail

---

#### 3. Model Layer (`item.model.ts`)
**Responsibility:** Database operations only

**Required Changes:**

```typescript
// MODIFY: Add transaction support to existing function
const getItemByBarcode = async (
  barcode: string,
  trx?: Prisma.TransactionClient,
) => {
  const client = trx || prisma;
  
  return client.item.findUnique({
    where: { barcode },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

// NEW: Extract single upsert logic from current importItems
const upsertItem = async (
  item: ImportItem,
  trx: Prisma.TransactionClient,
) => {
  const result = await trx.item.upsert({
    where: { barcode: item.barcode || " " },
    update: {
      name: item.name,
      category: item.category,
      expiryDate: item.expiryDate,
      description: item.description,
      locationId: item.locationId,
      itemUnits: {
        update: item.itemUnits.map((u) => ({
          where: { id: u.id || -1 },
          data: {
            unitType: u.unitType,
            rate: u.rate,
            quantity: u.quantity,
            purchasePrice: u.purchasePrice,
          },
        })),
      },
    },
    create: {
      name: item.name,
      category: item.category,
      expiryDate: item.expiryDate,
      description: item.description,
      locationId: item.locationId,
      itemUnits: {
        createMany: {
          data: item.itemUnits.map((u) => ({
            unitType: u.unitType,
            rate: u.rate,
            quantity: u.quantity,
            purchasePrice: u.purchasePrice,
          })),
        },
      },
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
  
  return {
    ...result,
    wasUpdate: item.barcode ? true : false, // Heuristic for reporting
  };
};

// KEEP UNCHANGED: Already supports transaction parameter
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
            .filter((unit) => unit.isChanged)
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

// DEPRECATE: Remove array-based transaction version
// const importItems = async (items: ImportItems) => { ... }
```

**Key Decisions:**
- ✅ **Extract `upsertItem()` function**: Single responsibility, testable
- ✅ **Add transaction parameter to `getItemByBarcode()`**: Consistency with other model functions
- ✅ **No changes to `addItemHistory()`**: Already transaction-aware

---

#### 4. Utility Layer (`item.util.ts`)
**Responsibility:** Reusable, stateless logic

**No changes required** - existing utilities work correctly:
- ✅ `validateFile()`: Structure validation
- ✅ `transformImportedData()`: Excel → domain model mapping
- ✅ `markIsChangedUnit()`: Change detection

**Extract common logic** (NEW):

```typescript
// Extract row parsing into reusable function
const extractRowData = (worksheet: Worksheet): any[] => {
  const importedData = [] as any;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      importedData.push({
        warehouse: row.getCell(1).value,
        itemName: row.getCell(2).value,
        barcode: row.getCell(3).value,
        itemDescription: row.getCell(4).value,
        expiredDate: row.getCell(5).value,
        category: row.getCell(6).value,
        unitType1: row.getCell(7).value,
        unitType2: row.getCell(8).value,
        unitType3: row.getCell(9).value,
        rate1: row.getCell(10).value,
        rate2: row.getCell(11).value,
        rate3: row.getCell(12).value,
        quantity1: row.getCell(13).value,
        quantity2: row.getCell(14).value,
        quantity3: row.getCell(15).value,
        purchasePrice1: row.getCell(16).value,
        purchasePrice2: row.getCell(17).value,
        purchasePrice3: row.getCell(18).value,
        unitId1: row.getCell(19).value,
        unitId2: row.getCell(20).value,
        unitId3: row.getCell(21).value,
      });
    }
  });
  
  return importedData;
};
```

---

## Transaction Boundaries

### Critical Change: Array-Based → Callback-Based Transaction

**Current (Parallel):**
```typescript
return prisma.$transaction(
  items.map((item) => prisma.item.upsert({ ... }))
);
```

**Problem:** Array-based transactions execute operations in parallel. Cannot:
- Fetch old state before upsert
- Record history sequentially
- Guarantee order of operations

**Solution (Sequential):**
```typescript
return prisma.$transaction(async (trx) => {
  for (const item of items) {
    // 1. Fetch old state
    const existing = await getItemByBarcode(item.barcode, trx);
    
    // 2. Record history (if update)
    if (existing) {
      await addItemHistory(..., trx);
    }
    
    // 3. Perform upsert
    await upsertItem(item, trx);
  }
});
```

**Benefits:**
- ✅ Sequential execution ensures history recorded before upsert
- ✅ Single transaction scope ensures atomicity
- ✅ Rollback applies to all operations if any fail

**Performance Consideration:**
Sequential processing is **slower** than parallel for large imports. However:
- Atomicity requirement **mandates** sequential approach
- Prisma transaction timeout: 5 seconds (default) - configure if needed
- For large imports (>100 items), consider batch processing (future enhancement)

---

### Transaction Structure

```typescript
prisma.$transaction(async (trx) => {
  // All operations use `trx` parameter
  
  for (const item of items) {
    // Phase 1: READ (check existing state)
    const existingItem = await getItemByBarcode(item.barcode, trx);
    
    if (existingItem) {
      // Phase 2: DETECT CHANGES (business logic)
      const changedUnits = markIsChangedUnit(newUnits, oldUnits);
      
      // Phase 3: WRITE HISTORY (if changes exist)
      if (hasChanges) {
        await addItemHistory(changedUnits, oldUnits, user, "import", id, trx);
      }
    }
    
    // Phase 4: WRITE DATA (upsert item)
    await upsertItem(item, trx);
  }
  
  return summary;
}, {
  maxWait: 10000, // 10 seconds max wait time
  timeout: 20000, // 20 seconds total timeout (for large imports)
});
```

**Transaction Guarantees:**
- ✅ If history insert fails → upsert doesn't happen (rollback)
- ✅ If upsert fails → history is rolled back
- ✅ If any item in batch fails → entire import rolls back
- ✅ Location-based multi-tenancy filtering applies within transaction

---

## Change Detection Strategy

### Should Change Detection Be Separate from History Recording?

**Answer: YES** - Already implemented correctly via `markIsChangedUnit()` utility.

**Current Implementation:**
```typescript
// Utility function (stateless, reusable)
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

**Why This Design is Correct:**

| Aspect | Rationale |
|--------|-----------|
| **Separation of Concerns** | Change detection = business rule logic; History recording = persistence |
| **Reusability** | Same function for single-item update AND bulk import |
| **Testability** | Pure function - easy to unit test with different scenarios |
| **Performance** | Computed once, flag persists through pipeline |

**Integration Pattern:**
```typescript
// Service layer orchestrates
const changedUnits = markIsChangedUnit(newUnits, oldUnits);

// Model layer consumes flags
const addItemHistory = (newUnit, oldUnit, ...) => {
  data: newUnit
    .filter((unit) => unit.isChanged)  // <-- Uses detection result
    .map(...)
};
```

**No changes needed** - existing design is optimal.

---

## Error Propagation Strategy

### Current Error Handling Pattern

**Error Class Hierarchy:**
```
src/errors/index.ts:
- CustomError (base, status = 500)
- NotFoundError (status = 404)
- BadRequestError (status = 400)

src/errors/prismaHandler.ts:
- handlePrismaError(error, options?)
  Maps Prisma error codes to domain errors
```

**Propagation Flow:**
```
Model → Service → Controller → errorHandler middleware
```

### Bulk Import Error Scenarios

#### 1. Excel File Errors (Pre-Transaction)

**Location:** Service layer, before transaction starts

```typescript
const importItem = async (buffer: Buffer, user: UserInfo) => {
  try {
    // Parse and validate BEFORE transaction
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new CustomError("Excel file must have at least one worksheet", 400);
    }
    
    validateFile(worksheet); // Can throw BadRequestError
    const items = await transformImportedData(data); // Can throw NotFoundError
    const validated = validateItems(items); // Can throw BadRequestError
    
    // Transaction only starts after validation passes
    return await importItemsWithHistory(validated, user);
  } catch (error: any) {
    // Specific errors bubble up
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    // Database errors handled
    handlePrismaError(error);
  }
};
```

**Response Example:**
```json
{
  "success": false,
  "error": {
    "message": "Location 'Downtown Branch' not found!"
  }
}
```

**Status:** 404 (NotFoundError) or 400 (BadRequestError)

---

#### 2. Transaction Failures (Database Errors)

**Location:** Model layer during transaction

```typescript
const importItemsWithHistory = async (items, user) => {
  return prisma.$transaction(async (trx) => {
    for (const item of items) {
      // Can throw Prisma errors: P2002 (unique constraint), P2003 (FK violation), etc.
      await upsertItem(item, trx);
    }
  });
};
```

**Handling:** Caught by service layer's `handlePrismaError()`

**Response Example (Duplicate Barcode):**
```json
{
  "success": false,
  "error": {
    "message": "This barcode already exists. Please use a different value."
  }
}
```

**Status:** 409 (Conflict) or 400 (Bad Request)

**Rollback:** Automatic - Prisma rolls back entire transaction

---

#### 3. Partial Import Failures

**Problem:** If item #47 out of 100 fails, what happens?

**Current Behavior:** Entire transaction rolls back (desired for data integrity)

**Client Communication Strategy:**

```typescript
const importItemsWithHistory = async (items, user) => {
  return prisma.$transaction(async (trx) => {
    const results = [];
    let processedCount = 0;
    
    for (const item of items) {
      try {
        processedCount++;
        
        const existing = await getItemByBarcode(item.barcode, trx);
        
        if (existing) {
          const changedUnits = markIsChangedUnit(item.itemUnits, existing.itemUnits);
          const hasChanges = changedUnits.some((u) => u.isChanged);
          
          if (hasChanges) {
            await addItemHistory(changedUnits, existing.itemUnits, user, "import", existing.id, trx);
          }
        }
        
        const result = await upsertItem(item, trx);
        results.push(result);
        
      } catch (error: any) {
        // Enrich error with context
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new CustomError(
            `Import failed at item ${processedCount} (${item.name}): ${error.message}`,
            500,
            { cause: error }
          );
        }
        throw error;
      }
    }
    
    return {
      imported: results.length,
      updated: results.filter((r) => r.wasUpdate).length,
      created: results.filter((r) => !r.wasUpdate).length,
    };
  });
};
```

**Response Example (Failure at Item 47):**
```json
{
  "success": false,
  "error": {
    "message": "Import failed at item 47 (Aspirin 500mg): Unique constraint violation on barcode"
  }
}
```

**Status:** 500 (Server Error) or specific error status

**User Action:** Fix item #47 in Excel and retry entire import

---

#### 4. Transaction Timeout

**Scenario:** Large import (500+ items) exceeds Prisma's default 5-second timeout

**Configuration:**
```typescript
prisma.$transaction(async (trx) => {
  // ... import logic
}, {
  maxWait: 10000,  // Max time to wait for transaction to start (10s)
  timeout: 30000,  // Max time for transaction to complete (30s)
});
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Transaction timeout - import took too long. Try importing fewer items at once."
  }
}
```

**Status:** 500 (Server Error)

**User Action:** Split Excel file into smaller batches

---

### Error Response Format

**All errors follow existing pattern** (via `errorHandler` middleware):

```typescript
// src/middlewares/errorHandler.ts
res.status(statusCode).json({
  success: false,
  error: {
    message,
  },
});
```

**Success response** (existing `sendResponse` utility):
```json
{
  "success": true,
  "message": "Items imported successfully",
  "data": {
    "imported": 95,
    "updated": 42,
    "created": 53
  }
}
```

**No changes needed** - existing error handling infrastructure sufficient.

---

## Testing Strategy

### Challenge: No Test Framework Currently

**Current State:**
```bash
npm list --depth=0 | grep test
# (empty - no test frameworks installed)
```

**Recommendation:** Implement testing as part of this milestone for:
- Regression prevention (history tracking is critical audit feature)
- Transaction logic validation (complex orchestration)
- Edge case coverage (partial failures, rollbacks, change detection)

---

### Recommended Test Framework: Vitest

**Why Vitest over Jest:**
- Native TypeScript support (no ts-jest configuration)
- Faster execution (ESM-native)
- Compatible with existing Prisma setup
- Better DX for modern Node.js projects

**Installation:**
```bash
pnpm add -D vitest @vitest/ui
pnpm add -D @types/node
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

---

### Testing Layers

#### Layer 1: Utility Functions (Unit Tests)

**File:** `tests/unit/item.util.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { markIsChangedUnit } from '../../src/utils/item.util';

describe('markIsChangedUnit', () => {
  it('should mark unit as changed when purchasePrice differs', () => {
    const oldUnits = [
      { id: 1, unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
    ];
    
    const newUnits = [
      { id: 1, unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 600 },
    ];
    
    const result = markIsChangedUnit(newUnits, oldUnits);
    
    expect(result[0].isChanged).toBe(true);
  });
  
  it('should not mark unit as changed when all fields match', () => {
    const oldUnits = [
      { id: 1, unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
    ];
    
    const newUnits = [
      { id: 1, unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
    ];
    
    const result = markIsChangedUnit(newUnits, oldUnits);
    
    expect(result[0].isChanged).toBe(false);
  });
  
  it('should mark unit as changed when quantity differs', () => {
    // ... test case
  });
});
```

**Coverage Target:** All change detection scenarios

---

#### Layer 2: Model Functions (Integration Tests)

**File:** `tests/integration/item.model.test.ts`

**Setup:** Use `@prisma/client` test utilities

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import * as itemModel from '../../src/models/item.model';

const prisma = new PrismaClient();

describe('Item Model - History Tracking', () => {
  beforeEach(async () => {
    // Clean database between tests
    await prisma.itemHistory.deleteMany();
    await prisma.item.deleteMany();
  });
  
  it('should create history record within transaction', async () => {
    // Arrange: Create test item
    const item = await prisma.item.create({
      data: {
        name: 'Test Item',
        category: 'Medicine',
        expiryDate: new Date(),
        locationId: 1,
        itemUnits: {
          create: [
            { unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
          ],
        },
      },
      include: { itemUnits: true },
    });
    
    // Act: Add history in transaction
    await prisma.$transaction(async (trx) => {
      await itemModel.addItemHistory(
        [{ id: item.itemUnits[0].id, unitType: 'btl', rate: 1, quantity: 150, purchasePrice: 600, isChanged: true }],
        [{ id: item.itemUnits[0].id, unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 }],
        { id: 'user-1', name: 'Test User' },
        'import',
        item.id,
        trx,
      );
    });
    
    // Assert: History record created
    const histories = await prisma.itemHistory.findMany({
      where: { itemId: item.id },
      include: { itemHistoryDetails: true },
    });
    
    expect(histories).toHaveLength(1);
    expect(histories[0].action).toBe('import');
    expect(histories[0].itemHistoryDetails[0].oldQuantity).toBe(100);
    expect(histories[0].itemHistoryDetails[0].newQuantity).toBe(150);
  });
  
  it('should rollback history if upsert fails', async () => {
    // ... test transaction rollback
  });
});
```

**Coverage Target:**
- History creation with `action: "import"`
- Transaction rollback scenarios
- Multiple items with mixed create/update

---

#### Layer 3: Service Layer (Integration Tests)

**File:** `tests/integration/item.service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import * as itemService from '../../src/services/item.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Item Service - Bulk Import with History', () => {
  beforeEach(async () => {
    await prisma.itemHistory.deleteMany();
    await prisma.item.deleteMany();
  });
  
  it('should import new items without creating history', async () => {
    // Arrange: Excel buffer with new items
    const buffer = createTestExcel([
      { itemName: 'Item 1', barcode: null, ... },
    ]);
    
    const user = { id: 'user-1', name: 'Test User' };
    
    // Act
    const result = await itemService.importItem(buffer, user);
    
    // Assert
    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    
    const histories = await prisma.itemHistory.findMany();
    expect(histories).toHaveLength(0); // No history for new items
  });
  
  it('should create history only for changed items', async () => {
    // Arrange: Create existing item
    const existing = await prisma.item.create({
      data: {
        name: 'Existing Item',
        barcode: 'BARCODE-123',
        category: 'Medicine',
        expiryDate: new Date(),
        locationId: 1,
        itemUnits: {
          create: [
            { unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
          ],
        },
      },
    });
    
    // Act: Import with changed quantity
    const buffer = createTestExcel([
      { itemName: 'Existing Item', barcode: 'BARCODE-123', quantity1: 150, ... },
    ]);
    
    const result = await itemService.importItem(buffer, user);
    
    // Assert
    expect(result.updated).toBe(1);
    
    const histories = await prisma.itemHistory.findMany({
      where: { itemId: existing.id },
      include: { itemHistoryDetails: true },
    });
    
    expect(histories).toHaveLength(1);
    expect(histories[0].action).toBe('import');
    expect(histories[0].itemHistoryDetails[0].oldQuantity).toBe(100);
    expect(histories[0].itemHistoryDetails[0].newQuantity).toBe(150);
  });
  
  it('should not create history when no fields changed', async () => {
    // ... test no-op import
  });
  
  it('should rollback entire import if one item fails', async () => {
    // Arrange: 3 items, one with invalid data
    const buffer = createTestExcel([
      { itemName: 'Item 1', ... },
      { itemName: 'Item 2', locationId: 9999 }, // Invalid location
      { itemName: 'Item 3', ... },
    ]);
    
    // Act & Assert
    await expect(itemService.importItem(buffer, user)).rejects.toThrow();
    
    // Assert: No items or histories created
    const items = await prisma.item.findMany();
    const histories = await prisma.itemHistory.findMany();
    
    expect(items).toHaveLength(0);
    expect(histories).toHaveLength(0);
  });
});
```

**Coverage Target:**
- Create vs. update detection
- Change detection integration
- Transaction atomicity (all-or-nothing)
- Error scenarios with rollback

---

#### Layer 4: End-to-End (E2E Tests)

**File:** `tests/e2e/item.import.test.ts`

**Setup:** Use `supertest` for HTTP testing

```bash
pnpm add -D supertest @types/supertest
```

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index'; // Express app
import fs from 'fs';

describe('POST /api/v1/items/import', () => {
  it('should import Excel file and return summary', async () => {
    const buffer = fs.readFileSync('./tests/fixtures/valid-items.xlsx');
    
    const response = await request(app)
      .post('/api/v1/items/import')
      .set('Authorization', 'Bearer test-token')
      .attach('file', buffer, 'items.xlsx')
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('imported');
    expect(response.body.data).toHaveProperty('updated');
    expect(response.body.data).toHaveProperty('created');
  });
  
  it('should return 400 for invalid Excel format', async () => {
    // ... test validation error
  });
  
  it('should return 404 when location not found', async () => {
    // ... test business logic error
  });
});
```

**Coverage Target:**
- HTTP contract (request/response format)
- Authentication/authorization
- File upload handling
- Error responses

---

### Test Data Management

**Strategy:** Use factories for reusable test data

**File:** `tests/factories/item.factory.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export const createTestItem = async (overrides = {}) => {
  return prisma.item.create({
    data: {
      name: 'Test Item',
      category: 'Medicine',
      expiryDate: new Date('2025-12-31'),
      locationId: 1,
      barcode: `BARCODE-${Date.now()}`,
      itemUnits: {
        create: [
          { unitType: 'btl', rate: 1, quantity: 100, purchasePrice: 500 },
          { unitType: 'pcs', rate: 10, quantity: 1000, purchasePrice: 50 },
          { unitType: 'tab', rate: 100, quantity: 10000, purchasePrice: 5 },
        ],
      },
      ...overrides,
    },
    include: { itemUnits: true },
  });
};

export const createTestExcel = (items: any[]): Buffer => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Items');
  
  // Add headers
  worksheet.columns = [
    { header: 'Warehouse', key: 'warehouse' },
    { header: 'Item Name', key: 'itemName' },
    // ... all columns
  ];
  
  // Add rows
  worksheet.addRows(items);
  
  return workbook.xlsx.writeBuffer();
};
```

---

### Test Execution

**Scripts:** `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**CI Integration:** Add to `.circleci/config.yml` or GitHub Actions

```yaml
- name: Run tests
  run: pnpm test
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

### Testing Priority

| Priority | Test Type | Rationale |
|----------|-----------|-----------|
| **P0** | Model layer integration tests | Validates core transaction + history logic |
| **P1** | Service layer integration tests | Validates business logic orchestration |
| **P2** | Utility unit tests | Quick feedback on change detection |
| **P3** | E2E tests | Validates full stack integration |

**Coverage Target:** 80% for model/service layers (critical business logic)

---

## Integration Points with Existing Code

### Files Requiring Modification

| File | Changes | Complexity |
|------|---------|------------|
| `src/controllers/item.controller.ts` | Add `req.user` parameter to `importItem()` call | Low |
| `src/services/item.service.ts` | Extract `importItemsWithHistory()` function, refactor transaction | Medium |
| `src/models/item.model.ts` | Add `upsertItem()` function, add transaction param to `getItemByBarcode()` | Low |
| `src/utils/item.util.ts` | Extract `extractRowData()` function (optional refactor) | Low |
| `prisma/schema.prisma` | No changes (schema already supports history) | None |

---

### Refactoring Needs in Existing Single-Item History Code

**Current Implementation Review:**

**✅ KEEP UNCHANGED:**
- `addItemHistory()` in `item.model.ts` - Already transaction-aware and action-agnostic
- `markIsChangedUnit()` in `item.util.ts` - Reusable pure function
- `updateItem()` in `item.service.ts` - Pattern to replicate for bulk imports

**⚠️ REFACTOR SUGGESTIONS (Optional, not blocking):**

#### 1. Decimal Precision Handling

**Current Pattern:**
```typescript
// Service layer manually converts Decimal → number
const parsedOldItem = {
  ...oldItem,
  itemUnits: oldItem.itemUnits.map((unit) => ({
    ...unit,
    purchasePrice: unit.purchasePrice.toNumber(),
  })),
};
```

**Recommendation:** Extract to utility function

```typescript
// src/utils/item.util.ts
export const parseItemUnits = (units: any[]) => {
  return units.map((unit) => ({
    ...unit,
    purchasePrice: unit.purchasePrice.toNumber(),
  }));
};

// Usage in service
const parsedOldItem = {
  ...oldItem,
  itemUnits: parseItemUnits(oldItem.itemUnits),
};
```

**Benefit:** Reusable in both single-item update and bulk import flows

---

#### 2. User Context Consistency

**Current:** `updateItem()` receives `user: UserInfo` parameter

**Recommendation:** Ensure `importItem()` also receives `user` parameter (already recommended in architecture)

**Migration:**
```typescript
// Before
const importItem = async (buffer: Buffer) => { ... }

// After
const importItem = async (buffer: Buffer, user: UserInfo) => { ... }
```

**Controller Update:**
```typescript
// src/controllers/item.controller.ts
const importItem = async (req, res, next) => {
  const result = await itemService.importItem(req.file.buffer, req.user);
  //                                                            ^^^^^^^^ Add
};
```

---

#### 3. Transaction Timeout Configuration

**Current:** Uses Prisma defaults (5s timeout)

**Recommendation:** Centralize timeout configuration

```typescript
// src/config/transaction.config.ts
export const TRANSACTION_CONFIG = {
  maxWait: 10000,  // 10s
  timeout: 20000,  // 20s
};

// Usage
prisma.$transaction(async (trx) => { ... }, TRANSACTION_CONFIG);
```

**Benefit:** Consistent timeout handling across all transactions (invoice, patient, item)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BULK IMPORT WITH HISTORY                          │
└─────────────────────────────────────────────────────────────────────────────┘

1. CLIENT REQUEST
   ↓
   POST /api/v1/items/import
   Headers: Authorization: Bearer <token>
   Body: multipart/form-data (Excel file)

2. ROUTE LAYER (item.route.ts)
   ↓
   - Middleware: verifyAuth (injects req.user)
   - Middleware: multer (parses file → req.file.buffer)
   ↓
   Controller: importItem(req, res, next)

3. CONTROLLER LAYER (item.controller.ts)
   ↓
   - Extract: buffer = req.file.buffer, user = req.user
   - Validate: if (!req.file) throw BadRequestError
   - Call: itemService.importItem(buffer, user)
   - Format response: sendResponse(res, 201, "Items imported", result)
   ↓
   Service: importItem(buffer, user)

4. SERVICE LAYER (item.service.ts)
   ↓
   ┌─── PRE-TRANSACTION VALIDATION ───┐
   │  - Parse Excel (ExcelJS)          │
   │  - Validate file structure        │
   │  - Transform data                 │
   │  - Validate business rules (Zod)  │
   └───────────────────────────────────┘
   ↓
   ┌─── TRANSACTION ORCHESTRATION ────────────────────────────────────────┐
   │  prisma.$transaction(async (trx) => {                               │
   │                                                                      │
   │    FOR EACH item in validatedItems {                                │
   │                                                                      │
   │      // Phase 1: Fetch existing state                               │
   │      existingItem = await getItemByBarcode(item.barcode, trx)       │
   │                                                                      │
   │      IF existingItem EXISTS {                                        │
   │        // Phase 2: Detect changes (business logic)                  │
   │        oldUnits = existingItem.itemUnits (parsed)                   │
   │        newUnitsWithFlags = markIsChangedUnit(item.itemUnits, oldUnits)│
   │                                                                      │
   │        // Phase 3: Record history (if changed)                      │
   │        IF any unit has isChanged=true {                             │
   │          await addItemHistory(                                      │
   │            newUnitsWithFlags,                                       │
   │            oldUnits,                                                │
   │            user,                                                    │
   │            action: "import",                                        │
   │            existingItem.id,                                         │
   │            trx                                                      │
   │          )                                                          │
   │        }                                                            │
   │      }                                                              │
   │                                                                      │
   │      // Phase 4: Upsert item                                        │
   │      result = await upsertItem(item, trx)                           │
   │      results.push(result)                                           │
   │    }                                                                │
   │                                                                      │
   │    RETURN { imported, updated, created }                            │
   │  })                                                                 │
   └──────────────────────────────────────────────────────────────────────┘
   ↓
   Model: getItemByBarcode(), addItemHistory(), upsertItem()

5. MODEL LAYER (item.model.ts)
   ↓
   ┌─── DATABASE OPERATIONS ───────────────────────────────────────────┐
   │                                                                   │
   │  getItemByBarcode(barcode, trx):                                 │
   │    → SELECT * FROM items WHERE barcode = ? (within transaction)  │
   │                                                                   │
   │  addItemHistory(units, oldUnits, user, action, itemId, trx):     │
   │    → INSERT INTO item_histories (...)                            │
   │    → INSERT INTO item_history_details (...) for changed units    │
   │                                                                   │
   │  upsertItem(item, trx):                                          │
   │    → ON CONFLICT (barcode) DO UPDATE ... ELSE INSERT             │
   │    → UPDATE item_units SET ... WHERE id IN (...)                 │
   │                                                                   │
   └───────────────────────────────────────────────────────────────────┘
   ↓
   Prisma Client → PostgreSQL

6. DATABASE (PostgreSQL)
   ↓
   ┌─── TRANSACTION COMMIT/ROLLBACK ────────────────────────────────────┐
   │                                                                    │
   │  IF all operations succeed:                                        │
   │    COMMIT TRANSACTION                                              │
   │    → items table updated                                           │
   │    → item_units table updated                                      │
   │    → item_histories table updated (for changed items)              │
   │    → item_history_details table updated                            │
   │                                                                    │
   │  IF any operation fails:                                           │
   │    ROLLBACK TRANSACTION                                            │
   │    → All changes reverted                                          │
   │    → Database state unchanged                                      │
   │                                                                    │
   └────────────────────────────────────────────────────────────────────┘

7. RESPONSE TO CLIENT
   ↓
   Success (201):
   {
     "success": true,
     "message": "Items imported successfully",
     "data": {
       "imported": 95,
       "updated": 42,
       "created": 53
     }
   }
   
   OR
   
   Error (400/404/500):
   {
     "success": false,
     "error": {
       "message": "Import failed at item 47 (Aspirin): Unique constraint violation"
     }
   }

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CHANGE DETECTION                               │
└─────────────────────────────────────────────────────────────────────────────┘

markIsChangedUnit(newUnits, oldUnits):
  FOR EACH newUnit {
    matchingOldUnit = oldUnits.find(u => u.id === newUnit.id)
    
    newUnit.isChanged = (
      newUnit.unitType !== oldUnit.unitType OR
      newUnit.rate !== oldUnit.rate OR
      newUnit.quantity !== oldUnit.quantity OR
      newUnit.purchasePrice !== oldUnit.purchasePrice
    )
  }
  
  RETURN newUnits (with isChanged flags)

┌─────────────────────────────────────────────────────────────────────────────┐
│                             HISTORY RECORDING                               │
└─────────────────────────────────────────────────────────────────────────────┘

addItemHistory():
  CREATE item_histories RECORD:
    - userName: user.name
    - userId: user.id
    - action: "import"
    - itemId: itemId
    - createdAt: NOW()
  
  FOR EACH unit WHERE isChanged=true {
    CREATE item_history_details RECORD:
      - oldUnitType, newUnitType
      - oldRate, newRate
      - oldQuantity, newQuantity
      - oldPurchasePrice, newPurchasePrice
  }
```

---

## Summary: Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Sequential transaction** (callback-based) | Required for history correlation with item state | Slower than parallel (acceptable for audit requirements) |
| **History recording before upsert** | Rollback safety - if upsert fails, history isn't orphaned | Minimal - same pattern as single-item update |
| **Service layer orchestrates transactions** | Matches existing pattern, keeps controllers thin | Service layer has transaction logic (acceptable in this architecture) |
| **Reuse existing `addItemHistory()` function** | Consistency, no code duplication | None - function already designed for reuse |
| **Change detection via `markIsChangedUnit()`** | Pure function, testable, reusable | None - optimal design |
| **Action = "import" for bulk imports** | Distinguishes bulk from manual edits in audit trail | Requires schema update (already has enum support) |
| **No history for new items** | Only track changes, not creations | Business decision - align with existing behavior |
| **Enrich errors with item context** | Helps users identify which row failed | Minimal - improves DX |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Transaction Strategy** | HIGH | Examined existing codebase patterns (invoice, patient, item); callback-based transaction is proven approach |
| **Layer Boundaries** | HIGH | Existing architecture clearly separates concerns; integration follows established patterns |
| **Change Detection** | HIGH | `markIsChangedUnit()` already implemented and used; no modifications needed |
| **Error Propagation** | HIGH | Existing error handling infrastructure is comprehensive; no gaps identified |
| **Testing Approach** | MEDIUM | No tests currently exist; recommended approach is industry-standard but untested in this specific codebase |
| **Performance Impact** | MEDIUM | Sequential processing is slower but required; exact impact depends on import size (not benchmarked) |

---

## Open Questions

### 1. Transaction Timeout for Large Imports

**Question:** How many items should be supported in a single import?

**Context:** Prisma's default 5s timeout may not suffice for 500+ items

**Options:**
- **A)** Increase timeout to 30s (recommended above)
- **B)** Implement batch processing (split into chunks)
- **C)** Set limit on Excel file size (e.g., max 200 items)

**Recommendation:** Start with option A, add option C as safety net

---

### 2. History for Unchanged Items

**Question:** Should we record a "no-op" history entry when an item is imported but unchanged?

**Current Recommendation:** NO - only record history when `isChanged=true`

**Rationale:** Reduces noise, matches single-item behavior

**Alternative:** Record every import attempt for complete audit trail

---

### 3. Partial Success Handling

**Question:** Should we support partial success (commit what succeeded, report what failed)?

**Current Recommendation:** NO - all-or-nothing transaction

**Rationale:**
- Simplifies error handling
- Prevents inconsistent state
- User can fix errors and retry

**Alternative:** Process in batches, commit successful batches

---

## References

**Codebase Files Examined:**
- `src/controllers/item.controller.ts` - Controller pattern
- `src/services/item.service.ts` - Transaction orchestration, history integration
- `src/models/item.model.ts` - Database operations, transaction parameters
- `src/utils/item.util.ts` - Change detection, Excel parsing
- `src/errors/index.ts` - Error hierarchy
- `src/errors/prismaHandler.ts` - Prisma error mapping
- `src/middlewares/errorHandler.ts` - Global error handling
- `prisma/schema.prisma` - Database schema, history tables

**Prisma Documentation:**
- Interactive Transactions: https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions
- Transaction API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#transaction

**Related Patterns:**
- Invoice service (`src/services/invoice.service.ts`) - Complex transaction orchestration
- Patient service (`src/services/patient.service.ts`) - Transaction with related entities

---

*Last updated: 2025-03-19*
*Confidence: HIGH (based on comprehensive codebase analysis)*
