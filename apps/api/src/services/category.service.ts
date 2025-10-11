import { Category } from "../types/category.type";
import * as categoryModel from "../models/category.model";
import { PrismaQuery } from "@casl/prisma";
import { handlePrismaError } from "../errors/prismaHandler";

const addCategory = async (data: Category) => {
  try {
    const addedCategory = await categoryModel.addCategory(data);

    return addedCategory;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getCategories = async (abacFilter: PrismaQuery) => {
  try {
    const categories = await categoryModel.getCategories(abacFilter);

    return categories;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const updateCategory = async (data: Category, id: number) => {
  try {
    const updatedCategory = await categoryModel.updateCategory(data, id);

    return updatedCategory;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Category not found" });
  }
};

const deleteCategory = async (id: number) => {
  try {
    const deletedCategory = await categoryModel.deleteCategory(id);

    return deletedCategory;
  } catch (error: any) {
    handlePrismaError(error, {
      P2003:
        "Cannot delete category because there are expenses linked to it. Please remove or reassign those expenses first.",
    });
  }
};

export { addCategory, getCategories, updateCategory, deleteCategory };
