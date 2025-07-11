import prisma from "../config/prisma.client";
import { Item, Unit, UpdateItem, UpdateUnit } from "../types/item.type";

const addItem = async (data: Item, unit: Array<Unit>) => {
  const addedItem = await prisma.item.create({
    data: {
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      description: data?.description,
      pricePercent: data.pricePercent,
      locationId: data.locationId,
      itemUnits: {
        createMany: {
          data: unit.map((u) => ({
            unitType: u.unitType,
            unit: u.unit,
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

  return addedItem;
};

const getItems = async () => {
  const items = await prisma.item.findMany({
    include: {
      location: true,
      itemUnits: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return items;
};

const updateItem = async (
  data: UpdateItem,
  unit: Array<UpdateUnit>,
  id: number,
) => {
  const updated = await prisma.item.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      description: data?.description,
      pricePercent: data.pricePercent,
      locationId: data.locationId,
      itemUnits: {
        update: unit.map((u) => ({
          where: { id: u.id },
          data: {
            unitType: u.unitType,
            unit: u.unit,
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

  return updated;
};

const deleteItem = async (id: number) => {
  const deleted = await prisma.item.delete({
    where: {
      id,
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });

  return deleted;
};

export { addItem, getItems, updateItem, deleteItem };