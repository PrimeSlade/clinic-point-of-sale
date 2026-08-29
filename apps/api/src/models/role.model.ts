import prisma from "../config/prisma.client";
import { AssignRoleFrom, RoleForm } from "../types/role.type";

const addRole = async (data: RoleForm) => {
  return prisma.role.create({
    data: {
      name: data.name,
      permissions: {
        connect: [
          // Add user-selected permissions
          ...data.permissions.map((perm) => ({ id: perm.id })),
        ],
      },
    },
  });
};

const getRoles = async () => {
  return prisma.role.findMany();
};

const getRoleById = async (id: number) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
    },
  });
};

const updateRole = async (data: RoleForm, id: number) => {
  return prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      permissions: {
        set: [
          // Add user-selected permissions
          ...data.permissions.map((perm) => ({ id: perm.id })),
        ],
      },
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

export { addRole, getRoles, getRoleById, updateRole, deleteRole, assignRole };
