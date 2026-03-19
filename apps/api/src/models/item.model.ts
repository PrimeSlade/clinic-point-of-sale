import prisma from "../config/prisma.client";
import {
  ImportItems,
  Item,
  ItemQueryParams,
  Unit,
  UpdateItem,
  UpdateUnit,
} from "../types/item.type";
import { HistoryAction, Prisma } from "../generated/prisma";
import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "../types/auth.type";
import { markIsChangedUnit } from "../utils/item.util";

const addItem = async (data: Item, unit: Array<Unit>) => {
  return prisma.item.create({
    data: {
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      description: data?.description,
      locationId: data.locationId,
      itemUnits: {
        createMany: {
          data: unit.map((u) => ({
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
};

const getItems = async ({
  offset,
  limit,
  search,
  filter,
  user,
  abacFilter,
}: ItemQueryParams) => {
  const conditions: Prisma.ItemWhereInput[] = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  //Admin can search all locations
  if (user.role.name.toLowerCase() === "admin" && filter) {
    conditions.push({
      location: {
        name: { equals: filter, mode: "insensitive" },
      },
    });
  }

  const whereClause: Prisma.ItemWhereInput = {
    AND: [...[abacFilter as Prisma.ItemWhereInput], ...conditions],
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      skip: offset,
      take: limit,
      include: {
        location: true,
        itemUnits: true,
      },
      where: whereClause,
      orderBy: { id: "desc" },
    }),
    prisma.item.count({ where: whereClause }),
  ]);

  return { items, total };
};

const getItemById = async (id: number) => {
  return prisma.item.findUnique({
    where: {
      id,
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

const getItemByBarcode = async (barcode: string) => {
  return prisma.item.findUnique({
    where: {
      barcode: barcode,
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

const getAllItems = async (abacFilter: PrismaQuery) => {
  return prisma.item.findMany({
    include: {
      location: true,
      itemUnits: true,
    },
    where: abacFilter,
  });
};

const updateItem = async (
  data: UpdateItem,
  unit: Array<UpdateUnit>,
  id: number,
  trx: Prisma.TransactionClient,
) => {
  return trx.item.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      description: data?.description,
      locationId: data.locationId,
      itemUnits: {
        update: unit.map((u) => ({
          where: { id: u.id },
          data: {
            unitType: u.unitType,
            rate: u.rate,
            quantity: u.quantity,
            purchasePrice: u.purchasePrice,
          },
        })),
      },
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

const deleteItem = async (id: number, trx?: Prisma.TransactionClient) => {
  const client = trx || prisma;

  return client.item.delete({
    where: {
      id,
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

const importItems = async (items: ImportItems) => {
  return prisma.$transaction(
    items.map((item) =>
      prisma.item.upsert({
        where: { barcode: item.barcode || " " },
        update: {
          name: item.name,
          category: item.category,
          expiryDate: item.expiryDate,
          description: item.description,
          locationId: item.locationId,
          itemUnits: {
            update: item.itemUnits.map((u) => ({
              where: {
                id: u.id || -1,
              },
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
      }),
    ),
  );
};

/**
 * Fetch item by barcode within a transaction.
 * @param barcode - Item barcode to search for
 * @param trx - Prisma transaction client
 * @returns Item with location and units, or null if not found
 */
const getItemByBarcodeWithTrx = async (
  barcode: string,
  trx: Prisma.TransactionClient,
) => {
  return trx.item.findUnique({
    where: { barcode },
    include: { location: true, itemUnits: true },
  });
};

/**
 * Import items from Excel with history tracking for bulk operations.
 * Uses callback-based transaction for sequential processing to enable
 * change detection and history recording for each item.
 * 
 * Features:
 * - Pre-fetches existing items to detect changes
 * - Records history only for items with actual changes
 * - Returns summary with created/updated/skipped counts
 * - Maintains transactional consistency (full rollback on error)
 * 
 * @param items - Validated import items (from Excel transformation)
 * @param user - Authenticated user (for history attribution)
 * @param trx - Prisma transaction client
 * @returns Object with results array and summary statistics
 * @throws Prisma errors on database constraint violations
 */
const importItemsWithTransaction = async (
  items: ImportItems,
  user: UserInfo,
  trx: Prisma.TransactionClient,
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
      oldUnits = existingItem.itemUnits.map((u) => ({
        ...u,
        purchasePrice: u.purchasePrice.toNumber(),
        isChanged: false,
      })) as UpdateUnit[];

      // Map import units to have IDs from existing item
      const mappedNewUnits = item.itemUnits.map((u, idx) => ({
        ...u,
        id: oldUnits[idx]?.id ?? -1,
        isChanged: false,
      }));

      newUnitsWithFlags = markIsChangedUnit(mappedNewUnits, oldUnits);
      hasChanges = newUnitsWithFlags.some((u) => u.isChanged);
    }

    // 3. Perform upsert
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
            where: {
              id: u.id || -1,
            },
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
        barcode: item.barcode || undefined, // Let Prisma generate UUID if not provided
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
    
    // 4. Record history for updated items with changes
    if (existingItem && hasChanges) {
      await addItemHistory(
        newUnitsWithFlags,
        oldUnits,
        user,
        HistoryAction.import,
        result.id,
        trx,
      );
    }
    
    // Store result with action metadata
    results.push({
      item: result,
      action: existingItem 
        ? (hasChanges ? 'updated' : 'skipped')
        : 'created',
    });
  }
  
  // Generate summary
  const summary = {
    created: results.filter(r => r.action === 'created').length,
    updated: results.filter(r => r.action === 'updated').length,
    skipped: results.filter(r => r.action === 'skipped').length,
    errors: [] as string[],
  };
  
  return { results, summary };
};

/**
 * Records item history with before/after values for changed units.
 * Creates history entry with details for each unit that has changes.
 * 
 * @param newUnit - Array of units with new values (must have isChanged flag)
 * @param oldUnit - Array of units with old values (for comparison)
 * @param user - User performing the action (for attribution)
 * @param action - History action type (import, update, etc.)
 * @param itemId - ID of the item being modified
 * @param trx - Prisma transaction client
 * @returns Created history record
 */
const addItemHistory = (
  newUnit: Array<UpdateUnit>,
  oldUnit: Array<UpdateUnit>,
  user: UserInfo,
  action: HistoryAction,
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

/**
 * Retrieves item history records by item ID, ordered by most recent first.
 * Includes history details (before/after values) and user information.
 * 
 * @param itemId - ID of the item to get history for
 * @param trx - Optional Prisma transaction client (for testing)
 * @returns Array of history records with details and user info
 */
const getItemHistoriesById = async (
  itemId: number,
  trx?: Prisma.TransactionClient,
) => {
  const client = trx || prisma;
  
  return client.itemHistory.findMany({
    where: {
      itemId,
    },
    include: {
      itemHistoryDetails: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export {
  addItem,
  getItems,
  getItemById,
  getItemByBarcode,
  getAllItems,
  updateItem,
  deleteItem,
  importItems,
  importItemsWithTransaction,
  getItemByBarcodeWithTrx,
  addItemHistory,
  getItemHistoriesById,
};
