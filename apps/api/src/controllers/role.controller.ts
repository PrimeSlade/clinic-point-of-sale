import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as roleService from "../services/role.service";

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

    res.status(201).json({
      success: true,
      message: "Role created successfully!",
      data: addedRole,
    });
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

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully!",
      data: roles,
    });
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

    res.status(200).json({
      success: true,
      message: "Role fetched successfully!",
      data: role,
    });
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

  console.log(data);
  console.log(id);

  if (!data || !id) {
    throw new BadRequestError("Both role data and Id must be provided");
  }

  try {
    const updatedRole = await roleService.updateRole(data, id);

    res.status(200).json({
      success: true,
      message: "Roles updated successfully!",
      data: updatedRole,
    });
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

    res.status(200).json({
      success: true,
      message: "Role deleted successfully!",
      data: deletedRole,
    });
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

    res.status(200).json({
      success: true,
      message: "Role assigned successfully!",
      data: assignedRole,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addRole, getRoles, getRoleById, updateRole, deleteRole, assignRole };
