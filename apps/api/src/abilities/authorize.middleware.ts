import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";
import { Actions, AppAbility, Subjects } from "./abilities";
import { accessibleBy } from "@casl/prisma";
import fetchLocation from "../utils/fetchLocation";

const authorize = (
  action: string,
  subject: string,
  hasLocation: boolean = true,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ability = req?.ability as AppAbility;

    //Create
    if (action === "create") {
      if (ability?.can(action as Actions, subject as Subjects)) {
        return next();
      }
    }

    const where = accessibleBy(ability, action as Actions);

    if (
      action === "read" &&
      ability?.can(action as Actions, subject as Subjects)
    ) {
      if (ability.can("manage", "all")) {
        // Admin: no filter
        req.abacFilter = {};
      } else {
        // Normal user: filter only for the subject (not the whole `where`)
        req.abacFilter = where[subject];
      }

      return next();
    }

    //Update and Delete
    if (["update", "delete"].includes(action)) {
      if (ability.can(action as Actions, subject as Subjects)) {
        if (hasLocation) {
          const object = await fetchLocation(subject, req, where);
          if (object) {
            return next();
          } else {
            throw new CustomError("Forbidden", 403);
          }
        }
        return next();
      }
    }

    throw new CustomError("Forbidden", 403);
  };
};

export default authorize;
