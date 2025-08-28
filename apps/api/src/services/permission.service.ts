import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import * as permissionModel from "../models/permission.model";

const getPermissions = async () => {
  try {
    const permissions = await permissionModel.getPermissions();

    return permissions;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Permissions not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

export { getPermissions };