import type { AppAbility } from "../abilities/abilities";
import type { UserInfo } from "./auth.type";
import type { PrismaQuery } from "@casl/prisma";

declare global {
  namespace Express {
    interface Request {
      user: UserInfo;
      ability?: AppAbility;
      abacFilter?: PrismaQuery;
      subject?: any;
    }
  }
}

export {};
