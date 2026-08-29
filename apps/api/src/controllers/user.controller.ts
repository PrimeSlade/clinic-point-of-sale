import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("User data is required");
  }

  try {
    const user = await userService.addUser(data);

    sendResponse(res, 201, "User created successfully", user);
  } catch (error: any) {
    next(error);
  }
};

const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user.id;

  try {
    const user = await userService.getUserById(userId);

    sendResponse(res, 200, "User fetched successfully", user);
  } catch (error: any) {
    next(error);
  }
};

const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const users = await userService.getUsers(abacFilter);

    sendResponse(res, 200, "Users fetched successfully", users);
  } catch (error: any) {
    next(error);
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.id;
  const data = req.body;

  if (!data || !userId) {
    throw new BadRequestError("Both user data and Id must be provided");
  }

  try {
    const updatedUser = await userService.updateUser(userId, data);

    sendResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error: any) {
    next(error);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.id;

  if (!userId) {
    throw new BadRequestError("Id must be provided");
  }

  try {
    const deletedUser = await userService.deleteUser(userId);

    sendResponse(res, 200, "User deleted successfully", deletedUser);
  } catch (error: any) {
    next(error);
  }
};

export { addUser, getUsers, getMe, updateUser, deleteUser };
