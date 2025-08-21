import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { BadRequestError } from "../errors/BadRequestError";

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

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: user,
    });
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

    res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      data: users,
    });
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

    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: updatedUser,
    });
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

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
      data: deletedUser,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addUser, getUsers, updateUser, deleteUser };
