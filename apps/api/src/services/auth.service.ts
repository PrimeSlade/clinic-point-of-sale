import { LoginCredentials, UserForm } from "../types/auth.type";
import * as authModel from "../models/auth.model";
import { NotFoundError } from "../errors/NotFoundError";
import { generatePassword, generateToken, verfiyPassword } from "../utils/auth";
import { CustomError } from "../errors/CustomError";
import { userInfo } from "os";

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

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const signup = async (data: UserForm) => {
  try {
    const hashed = await generatePassword(data.password);
    const user = await authModel.createUser({ ...data, password: hashed });

    return user;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new CustomError("Email already exists", 409);
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
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

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { login, signup, findInfo };
