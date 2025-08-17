import prisma from "../src/config/prisma.client";

async function main() {
  // Admin role with full access

  await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        create: [{ action: "manage", subject: "all" }],
      },
    },
  });

  // User role with limited access
  await prisma.role.create({
    data: {
      name: "user",
      permissions: {
        create: [
          { action: "read", subject: "Item" },
          { action: "read", subject: "Treatment" },
        ],
      },
    },
  });
}

main().finally(() => prisma.$disconnect());
