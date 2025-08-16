import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import { verfiyToken } from "../utils/auth";
import { CustomError } from "../errors/CustomError";

const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.posToken;

    if (!token) {
      throw new BadRequestError("No token provided");
    }

    const { id } = verfiyToken(token) as { id: string };

    req.userId = id;

    next();
  } catch (error: any) {
    next(new CustomError("Invalid or expired token", 401));
  }
};

export default verifyAuth;
