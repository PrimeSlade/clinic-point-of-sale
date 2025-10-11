import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors";
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
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const search = String(req.query.search || "");
  const filter = String(req.query.filter || "");
  const startDate = String(req.query.startDate || "");
  const endDate = String(req.query.endDate || "");

  const offset = (page - 1) * limit;
  const user = req.user;
  const abacFilter = req.abacFilter;

  try {
    const { expenses, total } = await expenseService.getExpenses({
      offset,
      limit,
      search,
      filter,
      user,
      startDate,
      endDate,
      abacFilter,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    res.status(200).json({
      success: true,
      message: "Expenses fetched successfully!",
      data: expenses,
      meta: {
        page,
        totalPages,
        totalItems: total,
        hasNextPage,
      },
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

const getReportExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startDate = String(req.query.startDate || "");
  const endDate = String(req.query.endDate || "");

  const user = req.user;
  const abacFilter = req.abacFilter;

  if (!startDate || !endDate) {
    throw new BadRequestError("Start date and end date are required");
  }

  try {
    const expenses = await expenseService.getReportExpenses({
      user,
      abacFilter,
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Report expenses fetched successfully!",
      data: expenses,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addExpense, getExpenses, updateExpense, deleteExpense, getReportExpenses };
