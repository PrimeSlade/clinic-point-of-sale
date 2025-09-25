import { PrismaQuery } from "@casl/prisma";
import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import { Expense, ExpenseQueryParams, UpdateExpense } from "../types/expense.type";

const addExpense = async (data: Expense) => {
  return prisma.expense.create({
    data: data,
  });
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
  const conditions: Prisma.ExpenseWhereInput[] = [];

  if (search) {
    conditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  //Admin can search all locations
  if (user.role.name.toLowerCase() === "admin" && filter) {
    conditions.push({
      location: {
        name: { equals: filter, mode: "insensitive" },
      },
    });
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    conditions.push({
      date: {
        gte: start,
        lte: end,
      },
    });
  }

  const whereClause: Prisma.ExpenseWhereInput = {
    AND: [
      ...conditions,
      abacFilter,
    ],
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      skip: offset,
      take: limit,
      include: {
        location: true,
        category: true,
      },
      where: whereClause,
      orderBy: { id: "desc" },
    }),

    prisma.expense.count({ where: whereClause }),
  ]);

  return { expenses, total };
};

const updateExpense = async (data: UpdateExpense, id: number) => {
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
