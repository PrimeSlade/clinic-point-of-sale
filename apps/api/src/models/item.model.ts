import prisma from "../config/prisma.client";
import { UnitType } from "../generated/prisma";
import { Item } from "../types/item.type";

const addItem = async (items: Item, unit: Array<UnitType>) => {
  //   const addedItem = await prisma.item.create({
  //     data: {
  //       name: items.name,
  //       category: items.category,
  //       expiryDate: items.expiryDate,
  //       description: items?.description,
  //       pricePercent: items.pricePercent,
  //     },
  //   });
};

const getItems = async () => {};

const updateItem = async (items: any, id: number) => {};
export { addItem, getItems, updateItem };
