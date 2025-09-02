import prisma from "../config/prisma.client";
import {
  Item,
  ItemQueryParams,
  Unit,
  UpdateItem,
  UpdateUnit,
} from "../types/item.type";
import { Prisma } from "../generated/prisma";

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
  if (user.role.name === "admin" && filter) {
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

const updateItem = async (
  data: UpdateItem,
  unit: Array<UpdateUnit>,
  id: number,
) => {
  return prisma.item.update({
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

const deleteItem = async (id: number) => {
  return prisma.item.delete({
    where: {
      id,
    },
    include: {
      location: true,
      itemUnits: true,
    },
  });
};

export { addItem, getItems, getItemById, updateItem, deleteItem };
