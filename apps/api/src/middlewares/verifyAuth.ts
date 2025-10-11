import { NextFunction, Request, Response } from "express";
import { BadRequestError, CustomError } from "../errors";
import { verfiyToken } from "../utils/auth";
import defineAbilities from "../abilities/abilities";
import * as authService from "../services/auth.service";
import { resolvePermissionDependencies } from "../utils/roleMapping";

const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.signedCookies.posToken;

    if (!token) {
      throw new BadRequestError("No token provided");
    }

    const { id } = verfiyToken(token) as { id: string };

    const user = await authService.findInfo(id);

    const depMap = resolvePermissionDependencies(user);

    req.ability = await defineAbilities(depMap);

    req.user = user;

    next();
  } catch (error: any) {
    throw new CustomError("Invalid or expired token", 401);
  }
};

export default verifyAuth;
