import prisma from "../config/prisma.client";

const getPermissions = async () => {
  return prisma.permission.findMany();
};

export { getPermissions };