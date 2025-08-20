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

    //Read
    if (
      action === "read" &&
      ability?.can(action as Actions, subject as Subjects)
    ) {
      req.abacFilter = where;
      return next();
    }

    //Update and Delete
    if (["update", "delete"].includes(action)) {
      if (hasLocation) {
        const object = await fetchLocation(subject, req, where);
        if (object && ability?.can(action as Actions, subject as Subjects)) {
          return next();
        }
      }
    }

    throw new CustomError("Forbidden", 403);
  };
};

export default authorize;
