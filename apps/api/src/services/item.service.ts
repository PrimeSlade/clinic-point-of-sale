import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import {
  Item,
  ItemPagination,
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

const getItems = async ({ offset, limit, search, filter }: ItemPagination) => {
  try {
    const { items, total } = await itemModel.getItems({
      offset,
      limit,
      search,
      filter,
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
    throw new CustomError("Database operation failed", 500);
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

export { addItem, getItems, getItemById, updateItem, deleteItem };
