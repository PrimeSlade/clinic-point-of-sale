import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  signed: true,
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    const { token, user } = await authService.login(data);

    res.cookie("posToken", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Successfully logged in!",
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;

  try {
    await authService.signup(data);

    res.status(201).json({
      success: true,
      message: "User successfully created!",
    });
  } catch (error: any) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("posToken");

  res.status(200).json({
    success: true,
    message: "Successfully logged out!",
  });
};

export { login, signup, logout };
