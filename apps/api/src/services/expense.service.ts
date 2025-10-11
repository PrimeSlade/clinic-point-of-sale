import {
  Expense,
  ExpenseQueryParams,
  UpdateExpense,
} from "../types/expense.type";
import { ReportQueryParams } from "../types/report.type";
import * as expenseModel from "../models/expense.model";
import { handlePrismaError } from "../errors/prismaHandler";

const addExpense = async (data: Expense) => {
  try {
    const addedExpense = await expenseModel.addExpense(data);

    return addedExpense;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getExpenses = async ({
  offset,
  limit,
  search,
  filter,
  user,
  startDate,
  endDate,
  abacFilter,
}: ExpenseQueryParams) => {
  try {
    const { expenses, total } = await expenseModel.getExpenses({
      offset,
      limit,
      search,
      filter,
      user,
      startDate,
      endDate,
      abacFilter,
    });

    const parsedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: expense.amount.toNumber(),
    }));

    return { expenses: parsedExpenses, total };
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const updateExpense = async (data: UpdateExpense, id: number) => {
  try {
    const updatedExpense = await expenseModel.updateExpense(data, id);

    return updatedExpense;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Expense not found" });
  }
};

const deleteExpense = async (id: number) => {
  try {
    const deletedExpense = await expenseModel.deleteExpense(id);

    return deletedExpense;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Expense not found" });
  }
};

const getReportExpenses = async ({
  user,
  abacFilter,
  startDate,
  endDate,
}: ReportQueryParams) => {
  try {
    const expenses = await expenseModel.getReportExpenses({
      user,
      abacFilter,
      startDate,
      endDate,
    });

    const parsedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: expense.amount.toNumber(),
    }));

    return parsedExpenses;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

export {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getReportExpenses,
};
