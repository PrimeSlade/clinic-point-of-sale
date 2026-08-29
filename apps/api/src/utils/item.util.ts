import { Worksheet } from "exceljs";
import { NotFoundError, BadRequestError } from "../errors";
import { getLocationByName } from "../models/location.model";
import {
  ImportItems,
  ImportUnit,
  UpdateUnit,
  ImportAction,
  ExistingItemWithUnits,
  ImportResult,
  ChangeDetectionResult,
} from "../types/item.type";

const transformImportedData = async (items: any) => {
  return Promise.all(
    items.map(async (item: any) => {
      const units: Array<ImportUnit> = [];

      for (let i = 1; i <= 3; i++) {
        const unitType = item[`unitType${i}`];
        if (unitType) {
          units.push({
            id: item[`unitId${i}`] ?? undefined,
            unitType,
            rate: item[`rate${i}`],
            quantity: item[`quantity${i}`],
            purchasePrice: item[`purchasePrice${i}`],
          });
        }
      }

      const location = await getLocationByName(item.warehouse);

      if (!location)
        throw new NotFoundError(`Location ${item.warehouse} not found!`);

      return {
        name: item.itemName,
        barcode: item.barcode ?? undefined,
        category: item.category,
        expiryDate: item.expiredDate,
        description: item.itemDescription ?? "",
        locationId: location.id,
        itemUnits: units,
      };
    }),
  );
};

const validateFile = (worksheet: Worksheet) => {
  const expectedHeaders = [
    "Warehouse",
    "Item Name",
    "Barcode",
    "Item Description",
    "Expired Date",
    "Category",
    "Unit Type1",
    "Unit Type2",
    "Unit Type3",
    "Rate1",
    "Rate2",
    "Rate3",
    "Quantity1",
    "Quantity2",
    "Quantity3",
    "Purchase Price1",
    "Purchase Price2",
    "Purchase Price3",
    "_UnitID1",
    "_UnitID2",
    "_UnitID3",
  ];

  const headerRow = worksheet.getRow(1);

  const actualHeaders: string[] = [];

  headerRow.eachCell((cell) =>
    actualHeaders.push(cell.value?.toString().trim() || ""),
  );

  //header length
  if (actualHeaders.length !== expectedHeaders.length) {
    throw new BadRequestError(
      `Invalid Excel format: Expected ${expectedHeaders.length} columns, found ${actualHeaders.length}`,
    );
  }

  for (let i = 0; i < expectedHeaders.length; i++) {
    if (actualHeaders[i].toLowerCase() !== expectedHeaders[i].toLowerCase()) {
      throw new BadRequestError(
        `Invalid Excel format: Column ${i + 1} should be "${expectedHeaders[i]}", found "${actualHeaders[i]}"`,
      );
    }
  }

  if (worksheet.rowCount <= 1) {
    throw new BadRequestError("Excel file has no data rows");
  }
};

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

/**
 * Detects changes between existing item units and incoming import units.
 */
const detectUnitChanges = (
  existingItem: ExistingItemWithUnits,
  importUnits: ImportItems[number]["itemUnits"],
): ChangeDetectionResult => {
  const oldUnits = existingItem.itemUnits.map((u) => ({
    ...u,
    purchasePrice: u.purchasePrice.toNumber(),
    isChanged: false,
  })) as UpdateUnit[];

  // Use Excel ID if present, otherwise fall back to position-based matching
  const mappedNewUnits = importUnits.map((u, idx) => ({
    ...u,
    id: u.id ?? -1,
    isChanged: false,
  }));

  const newUnitsWithFlags = markIsChangedUnit(mappedNewUnits, oldUnits);
  const hasChanges = newUnitsWithFlags.some((u) => u.isChanged);

  return { hasChanges, oldUnits, newUnitsWithFlags };
};

/**
 * Determines the import action based on existing item and changes.
 */
const determineImportAction = (
  existingItem: ExistingItemWithUnits | null,
  hasChanges: boolean,
): ImportAction => {
  if (!existingItem) return "created";
  return hasChanges ? "updated" : "skipped";
};

/**
 * Generates summary statistics from import results.
 */
const generateImportSummary = (results: ImportResult[]) => ({
  created: results.filter((r) => r.action === "created").length,
  updated: results.filter((r) => r.action === "updated").length,
  skipped: results.filter((r) => r.action === "skipped").length,
  errors: [] as string[],
});

export {
  transformImportedData,
  validateFile,
  markIsChangedUnit,
  detectUnitChanges,
  determineImportAction,
  generateImportSummary,
  type ImportResult,
  type ImportAction,
};
