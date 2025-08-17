import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import { verfiyToken } from "../utils/auth";
import { CustomError } from "../errors/CustomError";
import defineAbilities from "../abilities/abilities";
import * as authService from "../services/auth.service";

const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.signedCookies.posToken;

    if (!token) {
      throw new BadRequestError("No token provided");
    }

    const { id } = verfiyToken(token) as { id: string };

    const user = await authService.findInfo(id);

    req.ability = await defineAbilities(user);

    req.userId = user.id;

    next();
  } catch (error: any) {
    next(new CustomError("Invalid or expired token", 401));
  }
};

export default verifyAuth;
