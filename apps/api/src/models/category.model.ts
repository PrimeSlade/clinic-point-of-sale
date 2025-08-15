import prisma from "../config/prisma.client";
import { Category } from "../types/category.type";

const addCategory = async (data: Category) => {
  return prisma.category.create({
    data: data,
  });
};

const getCategories = async () => {
  return prisma.category.findMany({
    include: {
      location: true,
    },
    orderBy: { id: "desc" },
  });
};

const updateCategory = async (data: Category, id: number) => {
  return prisma.category.update({
    where: { id },
    data: data,
  });
};

const deleteCategory = async (id: number) => {
  return prisma.category.delete({
    where: { id },
  });
};

export { addCategory, getCategories, updateCategory, deleteCategory };
