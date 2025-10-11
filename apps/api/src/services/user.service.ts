import { CustomError, handlePrismaError, NotFoundError } from "../errors";
import { UserForm } from "../types/auth.type";
import { generatePassword } from "../utils/auth";
import * as userModel from "../models/user.model";
import { PrismaQuery } from "@casl/prisma";

const addUser = async (data: UserForm) => {
  try {
    const hashed = await generatePassword(data.password);
    const user = await userModel.addUser({ ...data, password: hashed });

    return user;
  } catch (error: any) {
    handlePrismaError(error, { P2002: "Email already exists" });
  }
};

const getUserById = async (id: string) => {
  try {
    const user = await userModel.getUserById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { password: _, ...userData } = user;

    return userData;
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const getUsers = async (abacFilter: PrismaQuery) => {
  try {
    const users = await userModel.getUsers(abacFilter);

    return users;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Users not found" });
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
    handlePrismaError(error, { P2025: "Users not found" });
  }
};

const deleteUser = async (id: string) => {
  try {
    const user = await userModel.deleteUser(id);

    return user;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "User not found" });
  }
};

export { addUser, getUsers, getUserById, updateUser, deleteUser };
