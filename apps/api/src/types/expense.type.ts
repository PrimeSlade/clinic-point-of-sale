import { PrismaQuery } from "@casl/prisma";

type Expense = {
  name: string;
  amount: number;
  date: Date;
  description?: string;
  locationId: number;
  categoryId: number;
};

type ExpenseQueryParams = {
  offset: number;
  limit: number;
  search: string;
  startDate?: string;
  endDate?: string;
  abacFilter: PrismaQuery;
};

type UpdateExpense = Partial<Expense>;

export { Expense, ExpenseQueryParams, UpdateExpense };
