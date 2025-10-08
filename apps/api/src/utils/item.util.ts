import { Worksheet } from "exceljs";
import { NotFoundError } from "../errors/NotFoundError";
import { getLocationByName } from "../models/location.model";
import { ImportUnit } from "../types/item.type";
import { BadRequestError } from "../errors/BadRequestError";

const transformImportedData = async (items: any) => {
  return Promise.all(
    items.map(async (item: any) => {
      const units: Array<ImportUnit> = [];

      for (let i = 1; i <= 3; i++) {
        const unitType = item[`unitType${i}`];
        if (unitType) {
          units.push({
            id: item[`unitId${i}`],
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
        barcode: item.barcode,
        category: item.category,
        expiryDate: item.expiredDate,
        description: item.itemDescription,
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

export { transformImportedData, validateFile };
