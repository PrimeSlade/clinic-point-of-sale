import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";
import { Actions, Subjects } from "./abilities";

const authorize = (action: string, subject: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.ability?.can(action as Actions, subject as Subjects)) {
      return next();
    }
    next(new CustomError("Forbidden", 403));
  };
};

export default authorize;
