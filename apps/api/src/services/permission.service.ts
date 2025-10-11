import { CustomError, NotFoundError } from "../errors";
import * as permissionModel from "../models/permission.model";
import { handlePrismaError } from "../errors/prismaHandler";

const getPermissions = async () => {
  try {
    const permissions = await permissionModel.getPermissions();

    return permissions;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

export { getPermissions };
