import { Request, Response, NextFunction } from "express";
import * as permissionService from "../services/permission.service";

const getPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const permissions = await permissionService.getPermissions();

    res.status(200).json({
      success: true,
      message: "Permissions fetched successfully!",
      data: permissions,
    });
  } catch (error: any) {
    next(error);
  }
};

export { getPermissions };