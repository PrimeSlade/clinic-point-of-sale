import { Category } from "../types/category.type";
import * as categoryModel from "../models/category.model";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomError } from "../errors/CustomError";

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

const getCategories = async () => {
  try {
    const categories = await categoryModel.getCategories();

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
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addCategory, getCategories, updateCategory, deleteCategory };
