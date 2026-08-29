import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";

export type ReportQueryParams = {
  user: UserInfo;
  abacFilter?: PrismaQuery;
  startDate: string;
  endDate: string;
};