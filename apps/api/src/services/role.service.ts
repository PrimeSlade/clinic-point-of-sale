import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { AssignRoleFrom, RoleForm } from "../types/role.type";
import * as roleModel from "../models/role.model";

const addRole = async (data: RoleForm) => {
  try {
    const addedRole = await roleModel.addRole(data);

    return addedRole;
  } catch (error: any) {
    throw new CustomError("Database operation failed", 500);
  }
};

const getRoles = async () => {
  try {
    const roles = await roleModel.getRoles();

    return roles;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Roles not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const getRoleById = async (id: number) => {
  try {
    const role = await roleModel.getRoleById(id);

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    return role;
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const updateRole = async (data: RoleForm, id: number) => {
  try {
    const updatedRole = await roleModel.updateRole(data, id);

    return updatedRole;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteRole = async (id: number) => {
  try {
    const deletedRole = await roleModel.deleteRole(id);

    return deletedRole;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    if (error.code === "P2003") {
      throw new CustomError(
        "Cannot delete role because there are users linked to it. Please remove or reassign those users first.",
        409,
      );
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const assignRole = async (data: AssignRoleFrom) => {
  try {
    const assignedRole = await roleModel.assignRole(data);

    return assignedRole;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500);
  }
};

export { addRole, getRoles, getRoleById, updateRole, deleteRole, assignRole };
