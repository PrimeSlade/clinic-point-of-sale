import prisma from "../src/config/prisma.client";
import bcryptjs from "bcryptjs";

async function main() {
  console.log("Starting user seed...");

  // 1. Create phone number
  const phoneNumber = await prisma.phoneNumber.create({
    data: {
      number: "+959123456789",
    },
  });
  console.log(`✓ Created phone number: ${phoneNumber.number}`);

  // 2. Create location
  const location = await prisma.location.create({
    data: {
      name: "Main Branch",
      address: "Yangon, Myanmar",
      phoneNumberId: phoneNumber.id,
    },
  });
  console.log(`✓ Created location: ${location.name}`);

  // 3. Create user (hash password with bcrypt)
  const hashedPassword = await bcryptjs.hash("11111", 12);
  
  // Get admin role (assuming it exists from role seed)
  const adminRole = await prisma.role.findFirst({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found. Please run role seed first.");
  }

  const user = await prisma.user.create({
    data: {
      name: "Sai",
      email: "sai@email.com",
      password: hashedPassword,
      pricePercent: 100,
      locationId: location.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✓ Created user: ${user.email}`);

  console.log("\nUser seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during user seeding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
