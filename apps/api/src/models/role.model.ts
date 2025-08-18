import prisma from "../config/prisma.client";
import { AssignRoleFrom, RoleForm } from "../types/role.type";

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

const assignRole = async (data: AssignRoleFrom) => {
  return prisma.$transaction([
    prisma.user.update({
      where: {
        id: data.userId,
      },
      data: {
        roleId: data.roleId,
      },
    }),
    prisma.role.update({
      where: {
        id: data.roleId,
      },
      data: {
        permissions: {
          //set replaces the current relation with the new array.
          set: data.permissions.map((perm) => ({
            id: perm.id,
          })),
        },
      },
    }),
  ]);
};

export { addRole, getRoles, updateRole, deleteRole, assignRole };
