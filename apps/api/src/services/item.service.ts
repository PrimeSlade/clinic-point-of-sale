import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import ExcelJS from "exceljs";
import {
  Item,
  ItemQueryParams,
  Unit,
  UpdateItem,
  UpdateUnit,
} from "../types/item.type";
import * as itemModel from "../models/item.model";

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

const exportItem = async () => {
  try {
    const items = await itemModel.getAllItems();

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
      { header: "Quantity1", key: "quantity1" },
      { header: "Quantity2", key: "quantity2" },
      { header: "Quantity3", key: "quantity3" },
      { header: "Unit1", key: "unit1" },
      { header: "Unit2", key: "unit2" },
      { header: "Unit3", key: "unit3" },
      { header: "Type1", key: "type1" },
      { header: "Type2", key: "type2" },
      { header: "Type3", key: "type3" },
      { header: "Rate1", key: "rate1" },
      { header: "Rate2", key: "rate2" },
      { header: "Rate3", key: "rate3" },
      { header: "Purchase Price1", key: "purchasePrice1" },
      { header: "Purchase Price2", key: "purchasePrice2" },
      { header: "Purchase Price3", key: "purchasePrice3" },
    ];

    return parsedItems;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Items not found");
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addItem, getItems, getItemById, exportItem, updateItem, deleteItem };
