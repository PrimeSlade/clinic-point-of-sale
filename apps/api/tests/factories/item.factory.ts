import { Prisma } from '../../src/generated/prisma';
import { Item, Unit, UpdateUnit } from '../../src/types/item.type';

/**
 * Creates a test item with units in the database.
 */
export async function createTestItem(
  trx: Prisma.TransactionClient,
  overrides?: Partial<{
    name: string;
    barcode: string;
    category: string;
    locationId: number;
    expiryDate: Date | null;
    units: Array<Partial<Unit>>;
  }>
) {
  return trx.item.create({
    data: {
      name: overrides?.name ?? 'Test Item',
      barcode: overrides?.barcode ?? `TEST-${Date.now()}`,
      category: overrides?.category ?? 'Test Category',
      locationId: overrides?.locationId ?? 1,
      description: 'Test Description',
      expiryDate: overrides?.expiryDate ?? new Date('2025-12-31'),
      itemUnits: {
        createMany: {
          data: (overrides?.units ?? [
            { unitType: 'btl', rate: 1, quantity: 10, purchasePrice: 100 },
          ]).map((u) => ({
            unitType: u.unitType ?? 'btl',
            rate: u.rate ?? 1,
            quantity: u.quantity ?? 10,
            purchasePrice: u.purchasePrice ?? 100,
          })),
        },
      },
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
}

/**
 * Creates a test user for history attribution.
 */
export async function createTestUser(
  trx: Prisma.TransactionClient,
  overrides?: Partial<{
    name: string;
    email: string;
    roleId: number;
  }>
) {
  return trx.user.create({
    data: {
      name: overrides?.name ?? 'Test User',
      email: overrides?.email ?? `test-${Date.now()}@example.com`,
      password: 'hashedpassword',
      roleId: overrides?.roleId ?? 1,
    },
  });
}

/**
 * Creates import-shaped data for testing.
 */
export function mockImportItem(
  overrides?: Partial<{
    name: string;
    barcode: string;
    category: string;
    locationId: number;
    expiryDate: Date | null;
    units: Array<Partial<Unit>>;
  }>
) {
  return {
    name: overrides?.name ?? 'Import Item',
    barcode: overrides?.barcode ?? `IMP-${Date.now()}`,
    category: overrides?.category ?? 'Import Category',
    locationId: overrides?.locationId ?? 1,
    description: 'Import Description',
    expiryDate: overrides?.expiryDate ?? new Date('2025-12-31'),
    itemUnits: (overrides?.units ?? [
      { unitType: 'btl', rate: 1, quantity: 20, purchasePrice: 150 },
    ]).map((u) => ({
      unitType: u.unitType ?? 'btl',
      rate: u.rate ?? 1,
      quantity: u.quantity ?? 20,
      purchasePrice: u.purchasePrice ?? 150,
      id: -1, // Will be filled during import
    })),
  };
}
