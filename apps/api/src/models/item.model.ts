import prisma from "../config/prisma.client";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Item, Unit, UpdateItem, UpdateUnit } from "../types/item.type";

const addItem = async (data: Item, unit: Array<Unit>) => {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500);
  }
};

const getItems = async () => {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteItem = async (id: number) => {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

export { addItem, getItems, updateItem, deleteItem };
