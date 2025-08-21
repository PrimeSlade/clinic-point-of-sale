import { PrismaQuery } from "@casl/prisma";
import prisma from "../config/prisma.client";
import { UserForm } from "../types/auth.type";

const upsertUser = async (data: UserForm) => {
  return prisma.user.upsert({
    where: data.id ? { id: data.id } : { email: data.email },
    update: data,
    create: data,
  });
};

const getUsers = async (abacFilter: PrismaQuery) => {
  return prisma.user.findMany({
    where: abacFilter,
    orderBy: { id: "desc" },
  });
};

const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

export { upsertUser, getUsers, deleteUser };
