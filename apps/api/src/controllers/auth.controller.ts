import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { sendResponse } from "../utils/response";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // sameSite: "strict" as const,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  signed: true,
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    const { token, user } = await authService.login(data);

    res.cookie("posToken", token, cookieOptions);

    sendResponse(res, 200, "Successfully logged in", user);
  } catch (error: any) {
    next(error);
  }
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    await authService.signup(data);

    sendResponse(res, 201, "User successfully created", null);
  } catch (error: any) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("posToken");

  sendResponse(res, 200, "Successfully logged out", null);
};

export { login, signup, logout };
