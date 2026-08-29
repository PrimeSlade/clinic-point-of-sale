import prisma from "../config/prisma.client";

const getPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: { id: "asc" },
  });
};

export { getPermissions };
