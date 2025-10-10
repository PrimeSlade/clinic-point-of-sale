import { Category } from "../types/category.type";
import * as categoryModel from "../models/category.model";
import { NotFoundError, CustomError } from "../errors";
import { PrismaQuery } from "@casl/prisma";

const addCategory = async (data: Category) => {
  try {
    const addedCategory = await categoryModel.addCategory(data);

    return addedCategory;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getCategories = async (abacFilter: PrismaQuery) => {
  try {
    const categories = await categoryModel.getCategories(abacFilter);

    return categories;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const updateCategory = async (data: Category, id: number) => {
  try {
    const updatedCategory = await categoryModel.updateCategory(data, id);

    return updatedCategory;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteCategory = async (id: number) => {
  try {
    const deletedCategory = await categoryModel.deleteCategory(id);

    return deletedCategory;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    if (error.code === "P2003") {
      throw new CustomError(
        "Cannot delete category because there are expenses linked to it. Please remove or reassign those expenses first.",
        409,
      );
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addCategory, getCategories, updateCategory, deleteCategory };
