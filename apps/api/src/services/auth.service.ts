import { LoginCredentials, UserForm } from "../types/auth.type";
import * as authModel from "../models/auth.model";
import { NotFoundError, CustomError } from "../errors";
import { generatePassword, generateToken, verfiyPassword } from "../utils/auth";
import { handlePrismaError } from "../errors/prismaHandler";

const login = async (data: LoginCredentials) => {
  try {
    const info = await authModel.findInfo(data.email);

    if (!info) {
      throw new NotFoundError("Email not found!");
    }

    const valid = await verfiyPassword(data.password, info.password);

    if (!valid) {
      throw new CustomError("Password is incorrect", 401);
    }

    const token = generateToken(info.id);

    const { password: _, ...userData } = info;

    return { token, user: userData };
  } catch (error: any) {
    //Pass through known errors
    if (error instanceof CustomError || error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const signup = async (data: UserForm) => {
  try {
    const hashed = await generatePassword(data.password);
    const user = await authModel.createUser({ ...data, password: hashed });

    return user;
  } catch (error: any) {
    handlePrismaError(error, { P2002: "Email already exists" });
  }
};

const findInfo = async (id: string) => {
  try {
    const info = await authModel.findInfo(id, "id");

    if (!info) {
      throw new NotFoundError("User not found!");
    }

    const { password: _, ...userData } = info;

    return userData;
  } catch (error: any) {
    //Pass through known errors
    if (error instanceof CustomError || error instanceof NotFoundError) {
      throw error;
    }

    handlePrismaError(error);
  }
};

export { login, signup, findInfo };
