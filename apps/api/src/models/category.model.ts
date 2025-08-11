import prisma from "../config/prisma.client";
import { Category } from "../types/category.type";

const addCategory = async (data: Category) => {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      locationId: data.locationId,
    },
  });
};

const getCategories = async () => {
  return prisma.category.findMany({
    include: {
      location: true,
    },
  });
};

const updateCategory = async (data: Category, id: number) => {
  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      locationId: data.locationId,
    },
  });
};

const deleteCategory = async (id: number) => {
  return prisma.category.delete({
    where: { id },
  });
};

export { addCategory, getCategories, updateCategory, deleteCategory };
