import prisma from "../src/config/prisma.client";

async function main() {
  await prisma.role.create({
    data: {
      name: "admin",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
