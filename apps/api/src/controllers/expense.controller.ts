import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as expenseService from "../services/expense.service";

const addExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Item data is required");
  }

  try {
    const addedExpense = await expenseService.addExpense(data);

    res.status(201).json({
      success: true,
      message: "Expense created successfully!",
      data: addedExpense,
    });
  } catch (error: any) {
    next(error);
  }
};

const getExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const expenses = await expenseService.getExpenses(abacFilter);

    res.status(200).json({
      success: true,
      message: "Expenses fetched successfully!",
      data: expenses,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Both expense data and Id must be provided");
  }

  try {
    const updatedExpense = await expenseService.updateExpense(data, id);

    res.status(200).json({
      success: true,
      message: "Expense updated successfully!",
      data: updatedExpense,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Id must be provided");
  }

  try {
    const deletedExpense = await expenseService.deleteExpense(id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully!",
      data: deletedExpense,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addExpense, getExpenses, updateExpense, deleteExpense };
