import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";

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
  filter?: string;
  user: UserInfo;
  startDate?: string;
  endDate?: string;
  abacFilter: PrismaQuery;
};

type UpdateExpense = Partial<Expense>;

export { Expense, ExpenseQueryParams, UpdateExpense };
