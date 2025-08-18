import "express";
import { AppAbility } from "../abilities/abilities"; // import your type
import { UserInfo } from "./auth.type";
import { PrismaQuery } from "@casl/prisma";

declare module "express-serve-static-core" {
  interface Request {
    user: UserInfo;
    ability?: AppAbility;
    abacFilter?: PrismaQuery;
    subject?: any;
  }
}
