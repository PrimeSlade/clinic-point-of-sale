import { CustomError } from "../errors/CustomError";
import { UserForm } from "../types/auth.type";
import { generatePassword } from "../utils/auth";
import * as userModel from "../models/user.model";
import { PrismaQuery } from "@casl/prisma";
import { NotFoundError } from "../errors/NotFoundError";

const addUser = async (data: UserForm) => {
  try {
    const hashed = await generatePassword(data.password);
    const user = await userModel.addUser({ ...data, password: hashed });

    return user;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new CustomError("Email already exists", 409);
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getUserById = async (id: string) => {
  try {
    const user = await userModel.getUserById(id);

    if (!user) {
      throw new NotFoundError("User not found!");
    }

    const { password: _, ...userData } = user;

    return userData;
  } catch (error: any) {
    throw new CustomError("Database operation failed", 500);
  }
};

const getUsers = async (abacFilter: PrismaQuery) => {
  try {
    const users = await userModel.getUsers(abacFilter);

    return users;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Users not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const updateUser = async (id: string, data: UserForm) => {
  try {
    const userData = { ...data, id: id };
    if (data.password) {
      userData.password = await generatePassword(data.password);
    }
    const user = await userModel.updateUser(userData);

    return user;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteUser = async (id: string) => {
  try {
    const user = await userModel.deleteUser(id);

    return user;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

export { addUser, getUsers, getUserById, updateUser, deleteUser };
