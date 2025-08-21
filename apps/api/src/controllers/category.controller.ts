import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as categoryService from "../services/category.service";

const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Category data is required");
  }

  try {
    const addedCategory = await categoryService.addCategory(data);

    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: addedCategory,
    });
  } catch (error: any) {
    next(error);
  }
};

const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const categories = await categoryService.getCategories(abacFilter);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: categories,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Both category data and Id must be provided");
  }

  try {
    const updatedCategory = await categoryService.updateCategory(data, id);

    res.status(200).json({
      success: true,
      message: "Categories updated successfully!",
      data: updatedCategory,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  const abacFilter = req.abacFilter;

  if (!id) {
    throw new BadRequestError("Id must be provided");
  }

  try {
    const deletedCategory = await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully!",
      data: deletedCategory,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addCategory, getCategories, updateCategory, deleteCategory };
