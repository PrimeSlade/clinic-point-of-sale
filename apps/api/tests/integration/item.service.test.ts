import { describe, it, expect } from 'vitest';
import { withRollback } from '../helpers/transaction.helper';
import { createTestItem, mockImportItem, createTestUser } from '../factories/item.factory';
import * as itemModel from '../../src/models/item.model';

describe('importItem transaction', () => {
  it('should process items sequentially in transaction', async () => {
    await withRollback(async (trx) => {
      // Create test user
      const user = await createTestUser(trx);
      
      const items = [
        mockImportItem({ barcode: 'TEST-001', locationId: 1 }),
        mockImportItem({ barcode: 'TEST-002', locationId: 1 }),
      ];

      const results = await itemModel.importItemsWithTransaction(items, user, trx);

      expect(results).toHaveLength(2);
      expect(results[0].item.barcode).toBe('TEST-001');
      expect(results[1].item.barcode).toBe('TEST-002');
      expect(results[0].wasUpdate).toBe(false); // New items
      expect(results[0].hasChanges).toBe(false); // No existing to compare
    });
  });

  it('should create items when barcode does not exist', async () => {
    await withRollback(async (trx) => {
      const user = await createTestUser(trx);
      const newItem = mockImportItem({
        barcode: `NEW-${Date.now()}`,
        locationId: 1,
      });

      const results = await itemModel.importItemsWithTransaction(
        [newItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].item.barcode).toBe(newItem.barcode);
      expect(results[0].item.name).toBe(newItem.name);
      expect(results[0].wasUpdate).toBe(false);
      expect(results[0].hasChanges).toBe(false);
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

      const results = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].item.barcode).toBe('UPDATE-TEST');
      expect(results[0].item.name).toBe('Updated Name');
      expect(results[0].item.id).toBe(existingItem.id); // Same item updated
      expect(results[0].wasUpdate).toBe(true);
      expect(results[0].hasChanges).toBe(true); // Changes detected!
      expect(results[0].newUnitsWithFlags[0].isChanged).toBe(true);
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

      const results = await itemModel.importItemsWithTransaction(
        [importItem],
        user,
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].wasUpdate).toBe(true);
      expect(results[0].hasChanges).toBe(false); // No changes detected!
      expect(results[0].newUnitsWithFlags[0].isChanged).toBe(false);
    });
  });
});
