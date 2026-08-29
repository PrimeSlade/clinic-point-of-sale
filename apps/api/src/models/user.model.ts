import { PrismaQuery } from "@casl/prisma";
import prisma from "../config/prisma.client";
import { UserForm } from "../types/auth.type";

const addUser = async (data: UserForm) => {
  return prisma.user.create({
    data,
  });
};

const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
      location: true,
    },
  });
};

const getUsers = async (abacFilter: PrismaQuery) => {
  return prisma.user.findMany({
    where: abacFilter,
    orderBy: { id: "desc" },
    include: {
      role: true,
      location: true,
    },
  });
};

const updateUser = async (data: UserForm) => {
  return prisma.user.update({
    where: {
      id: data.id,
    },
    data,
  });
};

const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

export { addUser, getUsers, getUserById, updateUser, deleteUser };
