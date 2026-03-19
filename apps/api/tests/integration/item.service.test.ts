import { describe, it, expect } from 'vitest';
import { withRollback } from '../helpers/transaction.helper';
import { createTestItem, mockImportItem, createTestUser } from '../factories/item.factory';
import * as itemModel from '../../src/models/item.model';
import { HistoryAction } from '../../src/generated/prisma';
import prisma from '../../src/config/prisma.client';

describe('importItem transaction', () => {
  it('should process items sequentially in transaction', async () => {
    await withRollback(async (trx) => {
      // Create test user
      const user = await createTestUser(trx);
      
      const items = [
        mockImportItem({ barcode: 'TEST-001', locationId: 1 }),
        mockImportItem({ barcode: 'TEST-002', locationId: 1 }),
      ];

      const { results, summary } = await itemModel.importItemsWithTransaction(items, user, trx);

      expect(results).toHaveLength(2);
      expect(results[0].item.barcode).toBe('TEST-001');
      expect(results[1].item.barcode).toBe('TEST-002');
      expect(results[0].action).toBe('created'); // New items
      expect(results[1].action).toBe('created');
      expect(summary.created).toBe(2);
      expect(summary.updated).toBe(0);
      expect(summary.skipped).toBe(0);
    });
  });

  it('should create items when barcode does not exist', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      const newItem = mockImportItem({
        barcode: `NEW-${Date.now()}`,
        locationId: 1,
      });

      const { results, summary } = await itemModel.importItemsWithTransaction(
        [newItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].item.barcode).toBe(newItem.barcode);
      expect(results[0].item.name).toBe(newItem.name);
      expect(results[0].action).toBe('created');
      expect(summary.created).toBe(1);
      expect(summary.updated).toBe(0);
    });
  });

  it('should update items when barcode exists and detect changes', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'UPDATE-TEST',
        name: 'Original Name',
        locationId: 1,
      });

      // Import with same barcode but different values
      const importItem = mockImportItem({
        barcode: 'UPDATE-TEST',
        name: 'Updated Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 30, // Changed from 10
            purchasePrice: 200, // Changed from 100
          },
        ],
      });
      
      // Set the correct unit ID from the existing item
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      const { results, summary } = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].item.barcode).toBe('UPDATE-TEST');
      expect(results[0].item.name).toBe('Updated Name');
      expect(results[0].item.id).toBe(existingItem.id); // Same item updated
      expect(results[0].action).toBe('updated'); // Changes detected!
      expect(summary.updated).toBe(1);
      expect(summary.created).toBe(0);
      expect(summary.skipped).toBe(0);
    });
  });

  it('should NOT detect changes when values are identical', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'NO-CHANGE-TEST',
        name: 'Same Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      // Import with same barcode and same values
      const importItem = mockImportItem({
        barcode: 'NO-CHANGE-TEST',
        name: 'Same Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });
      
      // Set the correct unit ID
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      const { results, summary } = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('skipped'); // No changes detected!
      expect(summary.skipped).toBe(1);
      expect(summary.updated).toBe(0);
      expect(summary.created).toBe(0);
    });
  });
});

describe('importItem history recording', () => {
  it('should NOT create history for new items', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      const newItem = mockImportItem({
        barcode: `NEW-HISTORY-${Date.now()}`,
        locationId: 1,
      });

      const { results } = await itemModel.importItemsWithTransaction(
        [newItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('created');
      
      // Check that no history was created
      const histories = await itemModel.getItemHistoriesById(results[0].item.id, trx);
      expect(histories).toHaveLength(0);
    });
  });

  it('should create history for updated items with changes', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'HISTORY-TEST-CHANGE',
        name: 'Original Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      // Import with changes
      const importItem = mockImportItem({
        barcode: 'HISTORY-TEST-CHANGE',
        name: 'Updated Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 30, // Changed
            purchasePrice: 200, // Changed
          },
        ],
      });
      
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      const { results } = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results[0].action).toBe('updated');
      
      // Check that history was created
      const histories = await itemModel.getItemHistoriesById(results[0].item.id, trx);
      expect(histories).toHaveLength(1);
      
      // Verify history content
      const history = histories[0];
      expect(history.action).toBe(HistoryAction.import);
      expect(history.userId).toBe(user.id);
      expect(history.userName).toBe(user.name);
      expect(history.itemHistoryDetails).toHaveLength(1);
      
      const detail = history.itemHistoryDetails[0];
      expect(detail.oldQuantity).toBe(10);
      expect(detail.newQuantity).toBe(30);
      expect(detail.oldPurchasePrice.toNumber()).toBe(100);
      expect(detail.newPurchasePrice.toNumber()).toBe(200);
    });
  });

  it('should NOT create history for unchanged items', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'HISTORY-TEST-NOCHANGE',
        name: 'Same Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      // Import with same values (no changes)
      const importItem = mockImportItem({
        barcode: 'HISTORY-TEST-NOCHANGE',
        name: 'Same Name',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });
      
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      const { results } = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results[0].action).toBe('skipped');
      
      // Check that no history was created
      const histories = await itemModel.getItemHistoriesById(results[0].item.id, trx);
      expect(histories).toHaveLength(0);
    });
  });

  it('should record history with correct action="import"', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      const existingItem = await createTestItem(trx, {
        barcode: 'ACTION-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 5,
            purchasePrice: 50,
          },
        ],
      });

      const importItem = mockImportItem({
        barcode: 'ACTION-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 15, // Changed
            purchasePrice: 50,
          },
        ],
      });
      
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      await itemModel.importItemsWithTransaction([importItem], user, trx);
      
      const histories = await itemModel.getItemHistoriesById(existingItem.id, trx);
      expect(histories).toHaveLength(1);
      expect(histories[0].action).toBe(HistoryAction.import);
      expect(histories[0].action).not.toBe(HistoryAction.update);
    });
  });

  it('should record history with correct user attribution', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      const existingItem = await createTestItem(trx, {
        barcode: 'USER-ATTR-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 7,
            purchasePrice: 70,
          },
        ],
      });

      const importItem = mockImportItem({
        barcode: 'USER-ATTR-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'pkg',  // Changed type
            rate: 1,
            quantity: 7,
            purchasePrice: 70,
          },
        ],
      });
      
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      await itemModel.importItemsWithTransaction([importItem], user, trx);
      
      const histories = await itemModel.getItemHistoriesById(existingItem.id, trx);
      expect(histories).toHaveLength(1);
      expect(histories[0].userId).toBe(user.id);
      expect(histories[0].userName).toBe(user.name);
      expect(histories[0].user).toBeDefined();
      expect(histories[0].user.id).toBe(user.id);
      expect(histories[0].user.name).toBe(user.name);
    });
  });

  it('should handle mixed import: new items, updated with changes, unchanged items', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create two existing items
      const existingItem1 = await createTestItem(trx, {
        barcode: 'MIXED-1',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      const existingItem2 = await createTestItem(trx, {
        barcode: 'MIXED-2',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 20,
            purchasePrice: 200,
          },
        ],
      });

      // Import: 1 new, 1 updated with changes, 1 unchanged
      const imports = [
        mockImportItem({ barcode: 'MIXED-NEW', locationId: 1 }), // New
        mockImportItem({
          barcode: 'MIXED-1',
          locationId: 1,
          units: [
            {
              unitType: 'btl',
              rate: 1,
              quantity: 99, // Changed
              purchasePrice: 100,
            },
          ],
        }), // Updated with changes
        mockImportItem({
          barcode: 'MIXED-2',
          locationId: 1,
          units: [
            {
              unitType: 'btl',
              rate: 1,
              quantity: 20, // Same
              purchasePrice: 200, // Same
            },
          ],
        }), // Unchanged
      ];
      
      imports[1].itemUnits[0].id = existingItem1.itemUnits[0].id;
      imports[2].itemUnits[0].id = existingItem2.itemUnits[0].id;

      const { results, summary } = await itemModel.importItemsWithTransaction(imports, user, trx);

      expect(results).toHaveLength(3);
      expect(summary.created).toBe(1);
      expect(summary.updated).toBe(1);
      expect(summary.skipped).toBe(1);
      
      // New item: no history
      const history0 = await itemModel.getItemHistoriesById(results[0].item.id, trx);
      expect(history0).toHaveLength(0);
      
      // Updated with changes: has history
      const history1 = await itemModel.getItemHistoriesById(results[1].item.id, trx);
      expect(history1).toHaveLength(1);
      expect(history1[0].action).toBe(HistoryAction.import);
      
      // Unchanged: no history
      const history2 = await itemModel.getItemHistoriesById(results[2].item.id, trx);
      expect(history2).toHaveLength(0);
    });
  });
});

describe('importItem end-to-end integration', () => {
  it('should handle E2E import with history query verification', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'E2E-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      // Import with changes
      const importItem = mockImportItem({
        barcode: 'E2E-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 50,
            purchasePrice: 150,
          },
        ],
      });
      
      importItem.itemUnits[0].id = existingItem.itemUnits[0].id;

      const { results, summary } = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(summary.updated).toBe(1);
      
      // Query history to verify
      const histories = await itemModel.getItemHistoriesById(results[0].item.id, trx);
      expect(histories).toHaveLength(1);
      expect(histories[0].action).toBe(HistoryAction.import);
      expect(histories[0].itemHistoryDetails).toHaveLength(1);
      
      const detail = histories[0].itemHistoryDetails[0];
      expect(detail.oldQuantity).toBe(10);
      expect(detail.newQuantity).toBe(50);
      expect(detail.oldPurchasePrice.toNumber()).toBe(100);
      expect(detail.newPurchasePrice.toNumber()).toBe(150);
    });
  });

  it('should return history with import and edit entries ordered', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      // Create item
      const item = await createTestItem(trx, {
        barcode: 'HISTORY-ORDER-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 100,
          },
        ],
      });

      // First: import to create initial history
      const importItem1 = mockImportItem({
        barcode: 'HISTORY-ORDER-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 20, // Changed
            purchasePrice: 100,
          },
        ],
      });
      
      importItem1.itemUnits[0].id = item.itemUnits[0].id;
      await itemModel.importItemsWithTransaction([importItem1], user, trx);

      // Second: another import
      const importItem2 = mockImportItem({
        barcode: 'HISTORY-ORDER-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 30, // Changed again
            purchasePrice: 100,
          },
        ],
      });
      
      importItem2.itemUnits[0].id = item.itemUnits[0].id;
      await itemModel.importItemsWithTransaction([importItem2], user, trx);
      
      // Query history
      const histories = await itemModel.getItemHistoriesById(item.id, trx);
      expect(histories).toHaveLength(2);
      
      // Most recent first (second import)
      expect(histories[0].action).toBe(HistoryAction.import);
      expect(histories[0].itemHistoryDetails[0].newQuantity).toBe(30);
      
      // Older entry (first import)
      expect(histories[1].action).toBe(HistoryAction.import);
      expect(histories[1].itemHistoryDetails[0].newQuantity).toBe(20);
    });
  });
});

describe('importItem error handling', () => {
  it('should rollback on invalid locationId', async () => {
    const user = await withRollback(async (trx) => {
      return await createTestUser(trx);
    });
    
    // Try import with invalid location
    const invalidItem = mockImportItem({
      barcode: 'INVALID-LOC-TEST',
      locationId: 99999, // Non-existent location
    });

    await expect(
      prisma.$transaction(async (trx) => {
        return itemModel.importItemsWithTransaction([invalidItem], user, trx);
      }),
    ).rejects.toThrow();
  });

  it('should handle duplicate barcodes in same import batch', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      const items = [
        mockImportItem({ barcode: 'DUP-001', locationId: 1 }),
        mockImportItem({ barcode: 'DUP-002', locationId: 1 }),
      ];

      // Should create both items successfully
      const { results, summary } = await itemModel.importItemsWithTransaction(items, user, trx);
      
      expect(results).toHaveLength(2);
      expect(summary.created).toBe(2);
      expect(results[0].item.barcode).toBe('DUP-001');
      expect(results[1].item.barcode).toBe('DUP-002');
    });
  });

  it('should preserve Decimal precision for before/after values', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      
      const item = await createTestItem(trx, {
        barcode: 'DECIMAL-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 99.99,
          },
        ],
      });

      const importItem = mockImportItem({
        barcode: 'DECIMAL-TEST',
        locationId: 1,
        units: [
          {
            unitType: 'btl',
            rate: 1,
            quantity: 10,
            purchasePrice: 199.99, // Decimal change
          },
        ],
      });
      
      importItem.itemUnits[0].id = item.itemUnits[0].id;

      await itemModel.importItemsWithTransaction([importItem], user, trx);
      
      const histories = await itemModel.getItemHistoriesById(item.id, trx);
      const detail = histories[0].itemHistoryDetails[0];
      
      // Verify exact decimal precision
      expect(detail.oldPurchasePrice.toNumber()).toBe(99.99);
      expect(detail.newPurchasePrice.toNumber()).toBe(199.99);
    });
  });
});
