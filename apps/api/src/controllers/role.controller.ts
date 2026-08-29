import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors";
import * as roleService from "../services/role.service";
import { sendResponse } from "../utils/response";

const addRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Role data is required");
  }

  try {
    const addedRole = await roleService.addRole(data);

    sendResponse(res, 201, "Role created successfully", addedRole);
  } catch (error: any) {
    next(error);
  }
};

const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roles = await roleService.getRoles();

    sendResponse(res, 200, "Roles fetched successfully", roles);
  } catch (error: any) {
    next(error);
  }
};

const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Id must be provided");
  }

  try {
    const role = await roleService.getRoleById(id);

    sendResponse(res, 200, "Role fetched successfully", role);
  } catch (error: any) {
    next(error);
  }
};

const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Both role data and Id must be provided");
  }

  try {
    const updatedRole = await roleService.updateRole(data, id);

    sendResponse(res, 200, "Roles updated successfully", updatedRole);
  } catch (error: any) {
    next(error);
  }
};

const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Id must be provided");
  }

  try {
    const deletedRole = await roleService.deleteRole(id);

    sendResponse(res, 200, "Role deleted successfully", deletedRole);
  } catch (error: any) {
    next(error);
  }
};

const assignRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.id;
  const data = req.body;

  if (!userId) {
    throw new BadRequestError("user id must be provided");
  }

  try {
    const assignedRole = await roleService.assignRole({
      userId: userId,
      ...data,
    });

    sendResponse(res, 200, "Role assigned successfully", assignedRole);
  } catch (error: any) {
    next(error);
  }
};

export { addRole, getRoles, getRoleById, updateRole, deleteRole, assignRole };
