import prisma from "../../src/config/prisma.client";

async function main() {
  // Admin role with full access

  await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        connect: {
          id: 8,
        },
      },
    },
  });

  // User role with limited access
  await prisma.role.create({
    data: {
      name: "user",
      permissions: {
        connect: {
          id: 22,
        },
      },
    },
  });
}

main().finally(() => prisma.$disconnect());
