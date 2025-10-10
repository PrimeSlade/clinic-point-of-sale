import { CustomError, NotFoundError, BadRequestError } from "../errors";
import ExcelJS from "exceljs";
import {
  Item,
  ItemQueryParams,
  Unit,
  UpdateItem,
  UpdateUnit,
} from "../types/item.type";
import * as itemModel from "../models/item.model";
import { transformImportedData, validateFile } from "../utils/item.util";
import { PrismaQuery } from "@casl/prisma";
import { validateItems } from "../utils/validation";

type ExcelRow = {
  warehouse: string;
  itemName: string;
  barcode: string;
  itemDescription: string | null;
  expiredDate: Date;
  category: string;
  [key: string]: any; // Allow dynamic keys
};

const addItem = async (data: Item, unit: Array<Unit>) => {
  try {
    const addedItem = await itemModel.addItem(data, unit);

    return addedItem;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getItems = async ({
  offset,
  limit,
  search,
  filter,
  user,
  abacFilter,
}: ItemQueryParams) => {
  try {
    const { items, total } = await itemModel.getItems({
      offset,
      limit,
      search,
      filter,
      user,
      abacFilter,
    });

    //change string to number
    const parsedItems = items.map((item) => ({
      ...item,
      itemUnits: item.itemUnits.map((unit) => ({
        ...unit,
        purchasePrice: unit.purchasePrice.toNumber(),
      })),
    }));

    return { items: parsedItems, total };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Items not found");
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getItemById = async (id: number) => {
  try {
    const item = await itemModel.getItemById(id);

    //change string to number
    const parsedItem = {
      ...item,
      itemUnits: item?.itemUnits.map((unit) => ({
        ...unit,
        purchasePrice: unit.purchasePrice.toNumber(),
      })),
    };

    return parsedItem;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Items not found");
    }
    throw new CustomError("Database operation failed", 500);
  }
};

const updateItem = async (
  data: UpdateItem,
  unit: Array<UpdateUnit>,
  id: number,
) => {
  try {
    const updated = await itemModel.updateItem(data, unit, id);

    return updated;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteItem = async (id: number) => {
  try {
    const deleted = await itemModel.deleteItem(id);

    return deleted;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const importItem = async (buffer: Buffer) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new CustomError("Excel file must have at least one worksheet", 400);
    }

    //file error handling
    validateFile(worksheet);

    const importedData = [] as any;

    worksheet?.eachRow((row, rowNumber) => {
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

    const items = await transformImportedData(importedData);

    const validatedItems = validateItems(items);

    const result = await itemModel.importItems(validatedItems);

    return result;
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const exportItem = async (abacFilter: PrismaQuery) => {
  try {
    const items = await itemModel.getAllItems(abacFilter);

    const parsedItems = items.map((item) => ({
      ...item,
      itemUnits: item.itemUnits.map((unit) => ({
        ...unit,
        purchasePrice: unit.purchasePrice.toNumber(),
      })),
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Items");

    worksheet.columns = [
      { header: "Warehouse", key: "warehouse" },
      { header: "Item Name", key: "itemName" },
      { header: "Barcode", key: "barcode" },
      { header: "Item Description", key: "itemDescription" },
      { header: "Expired Date", key: "expiredDate" },
      { header: "Category", key: "category" },
      { header: "Unit Type1", key: "unitType1" },
      { header: "Unit Type2", key: "unitType2" },
      { header: "Unit Type3", key: "unitType3" },
      { header: "Rate1", key: "rate1" },
      { header: "Rate2", key: "rate2" },
      { header: "Rate3", key: "rate3" },
      { header: "Quantity1", key: "quantity1" },
      { header: "Quantity2", key: "quantity2" },
      { header: "Quantity3", key: "quantity3" },
      { header: "Purchase Price1", key: "purchasePrice1" },
      { header: "Purchase Price2", key: "purchasePrice2" },
      { header: "Purchase Price3", key: "purchasePrice3" },
      { header: "_UnitID1", key: "unitId1", hidden: true },
      { header: "_UnitID2", key: "unitId2", hidden: true },
      { header: "_UnitID3", key: "unitId3", hidden: true },
    ];

    //header
    worksheet.getRow(1).font = { bold: true };

    const transformData = parsedItems.map((item) => {
      const row: ExcelRow = {
        warehouse: item.location.name,
        itemName: item.name,
        barcode: item.barcode,
        itemDescription: item.description,
        expiredDate: item.expiryDate,
        category: item.category,
      };

      for (let i = 0; i < item.itemUnits.length; i++) {
        const unit = item.itemUnits[i];
        row[`unitId${i + 1}`] = unit.id;
        row[`quantity${i + 1}`] = unit.quantity;
        row[`unitType${i + 1}`] = unit?.unitType;
        row[`rate${i + 1}`] = unit?.rate;
        row[`purchasePrice${i + 1}`] = unit?.purchasePrice;
      }

      return row;
    });

    worksheet.addRows(transformData);

    return workbook;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Items not found");
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export {
  addItem,
  getItems,
  getItemById,
  importItem,
  exportItem,
  updateItem,
  deleteItem,
};
