import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";
import { Actions, AppAbility, Subjects } from "./abilities";
import { accessibleBy } from "@casl/prisma";

type Fetcher = (req: Request) => Promise<any>;

const authorize = (action: string, subject: string, fetcher?: Fetcher) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ability = req?.ability as AppAbility;

    //Create
    if (action === "create") {
      if (ability?.can(action as Actions, subject as Subjects)) {
        return next();
      }
    }

    //Read
    if (action === "read") {
      const where = accessibleBy(ability, "read");
      req.abacFilter = where;
      return next();
    }

    //Update and Delete
    if (["update", "delete"].includes(action)) {
      if (!fetcher) {
        throw new CustomError(
          `Fetcher is required for ${action} on ${subject}`,
        );
      }
      const object = await fetcher(req);

      if (ability?.can(action as Actions, object)) {
        req.subject = object;
        return next();
      }
    }

    throw new CustomError("Forbidden", 403);
  };
};

export default authorize;
