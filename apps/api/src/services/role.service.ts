import { CustomError, handlePrismaError, NotFoundError } from "../errors";
import { AssignRoleFrom, RoleForm } from "../types/role.type";
import * as roleModel from "../models/role.model";

const addRole = async (data: RoleForm) => {
  try {
    const addedRole = await roleModel.addRole(data);

    return addedRole;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getRoles = async () => {
  try {
    const roles = await roleModel.getRoles();

    return roles;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Roles not found" });
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
    handlePrismaError(error);
  }
};

const updateRole = async (data: RoleForm, id: number) => {
  try {
    const updatedRole = await roleModel.updateRole(data, id);

    return updatedRole;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Role not found" });
  }
};

const deleteRole = async (id: number) => {
  try {
    const deletedRole = await roleModel.deleteRole(id);

    return deletedRole;
  } catch (error: any) {
    handlePrismaError(error, {
      P2025: "Role not found",
      P2003:
        "Cannot delete role because there are users linked to it. Please remove or reassign those users first.",
    });
  }
};

const assignRole = async (data: AssignRoleFrom) => {
  try {
    const assignedRole = await roleModel.assignRole(data);

    return assignedRole;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

export { addRole, getRoles, getRoleById, updateRole, deleteRole, assignRole };
