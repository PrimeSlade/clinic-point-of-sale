import prisma from "../config/prisma.client";
import { Expense } from "../types/expense.type";

const addExpense = async (data: Expense) => {
  return prisma.expense.create({
    data: data,
  });
};

const getExpenses = async () => {
  return prisma.expense.findMany({
    include: {
      location: true,
      category: true,
    },
  });
};

const updateExpense = async (data: Expense, id: number) => {
  return prisma.expense.update({
    where: {
      id,
    },
    data: data,
  });
};

const deleteExpense = async (id: number) => {
  return prisma.expense.delete({
    where: {
      id,
    },
  });
};

export { addExpense, getExpenses, updateExpense, deleteExpense };
