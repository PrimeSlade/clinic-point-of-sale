import { Request, Response, NextFunction } from "express";
import * as permissionService from "../services/permission.service";
import { sendResponse } from "../utils/response";

const getPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const permissions = await permissionService.getPermissions();

    sendResponse(res, 200, "Permissions fetched successfully", permissions);
  } catch (error: any) {
    next(error);
  }
};

export { getPermissions };