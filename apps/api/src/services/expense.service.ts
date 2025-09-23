import { Expense } from "../types/expense.type";
import * as expenseModel from "../models/expense.model";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomError } from "../errors/CustomError";
import { PrismaQuery } from "@casl/prisma";

const addExpense = async (data: Expense) => {
  try {
    const addedExpense = await expenseModel.addExpense(data);

    return addedExpense;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getExpenses = async (abacFilter: PrismaQuery) => {
  try {
    const expenses = await expenseModel.getExpenses(abacFilter);

    const parsedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: expense.amount.toNumber(),
    }));

    return parsedExpenses;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const updateExpense = async (data: Expense, id: number) => {
  try {
    const updatedExpense = await expenseModel.updateExpense(data, id);

    return updatedExpense;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteExpense = async (id: number) => {
  try {
    const deletedExpense = await expenseModel.deleteExpense(id);

    return deletedExpense;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addExpense, getExpenses, updateExpense, deleteExpense };
