import prisma from "../config/prisma.client";
import { UserInfo } from "../types/auth.type";

const findInfo = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = async (data: UserInfo) => {
  return prisma.user.create({
    data: data,
  });
};

export { findInfo, createUser };
