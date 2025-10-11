import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors";
import * as expenseService from "../services/expense.service";
import { sendResponse } from "../utils/response";

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

    sendResponse(res, 201, "Expense created successfully", addedExpense);
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

    sendResponse(res, 200, "Expenses fetched successfully", expenses, {
      page,
      totalPages: totalPages,
      totalItems: total,
      hasNextPage,
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

    sendResponse(res, 200, "Expense updated successfully", updatedExpense);
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

    sendResponse(res, 200, "Expense deleted successfully", deletedExpense);
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

    sendResponse(res, 200, "Report expenses fetched successfully", expenses);
  } catch (error: any) {
    next(error);
  }
};

export {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getReportExpenses,
};
