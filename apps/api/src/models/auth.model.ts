import prisma from "../config/prisma.client";
import { UserForm } from "../types/auth.type";

const findInfo = async (data: string, searchMode: "email" | "id" = "email") => {
  return prisma.user.findUnique({
    where: searchMode === "email" ? { email: data } : { id: data },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
};

const createUser = async (data: UserForm) => {
  return prisma.user.create({
    data: data,
  });
};

export { findInfo, createUser };
