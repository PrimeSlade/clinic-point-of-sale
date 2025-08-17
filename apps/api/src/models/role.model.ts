import prisma from "../config/prisma.client";
import { RoleForm } from "../types/role.type";

const addRole = async ({ name }: RoleForm) => {
  return prisma.role.create({
    data: {
      name: name,
    },
  });
};

const getRoles = async () => {
  return prisma.role.findMany();
};

const updateRole = async ({ name }: RoleForm, id: number) => {
  return prisma.role.update({
    where: { id },
    data: {
      name: name,
    },
  });
};

const deleteRole = async (id: number) => {
  return prisma.role.delete({
    where: {
      id,
    },
  });
};

export { addRole, getRoles, updateRole, deleteRole };
