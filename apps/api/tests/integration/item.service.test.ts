import { describe, it, expect } from 'vitest';
import { withRollback } from '../helpers/transaction.helper';
import { createTestItem, mockImportItem } from '../factories/item.factory';
import * as itemModel from '../../src/models/item.model';

describe('importItem transaction', () => {
  it('should process items sequentially in transaction', async () => {
    await withRollback(async (trx) => {
      // Create test location first (assuming location id 1 exists from seed)
      const items = [
        mockImportItem({ barcode: 'TEST-001', locationId: 1 }),
        mockImportItem({ barcode: 'TEST-002', locationId: 1 }),
      ];

      const results = await itemModel.importItemsWithTransaction(items, trx);

      expect(results).toHaveLength(2);
      expect(results[0].barcode).toBe('TEST-001');
      expect(results[1].barcode).toBe('TEST-002');
    });
  });

  it('should create items when barcode does not exist', async () => {
    await withRollback(async (trx) => {
      const newItem = mockImportItem({
        barcode: `NEW-${Date.now()}`,
        locationId: 1,
      });

      const results = await itemModel.importItemsWithTransaction(
        [newItem],
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].barcode).toBe(newItem.barcode);
      expect(results[0].name).toBe(newItem.name);
    });
  });

  it('should update items when barcode exists', async () => {
    await withRollback(async (trx) => {
      // Create an existing item
      const existingItem = await createTestItem(trx, {
        barcode: 'UPDATE-TEST',
        name: 'Original Name',
        locationId: 1,
      });

      // Import with same barcode but different values
      // Map the unit IDs from the existing item
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
        trx,
      );

      expect(results).toHaveLength(1);
      expect(results[0].barcode).toBe('UPDATE-TEST');
      expect(results[0].name).toBe('Updated Name');
      expect(results[0].id).toBe(existingItem.id); // Same item updated
      expect(results[0].itemUnits[0].quantity).toBe(30); // Quantity updated
    });
  });
});
