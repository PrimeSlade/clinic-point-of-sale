import prisma from "../../src/config/prisma.client";

async function main() {
  const permissions = [
    //Admin
    { action: "manage", subject: "all" },
    // Category
    { action: "create", subject: "Category" },
    { action: "read", subject: "Category" },
    { action: "update", subject: "Category" },
    { action: "delete", subject: "Category" },
    { action: "manage", subject: "Category" },

    // Doctor
    { action: "create", subject: "Doctor" },
    { action: "read", subject: "Doctor" },
    { action: "update", subject: "Doctor" },
    { action: "delete", subject: "Doctor" },
    { action: "manage", subject: "Doctor" },

    // Expense
    { action: "create", subject: "Expense" },
    { action: "read", subject: "Expense" },
    { action: "update", subject: "Expense" },
    { action: "delete", subject: "Expense" },
    { action: "manage", subject: "Expense" },

    // Item
    { action: "create", subject: "Item" },
    { action: "read", subject: "Item" },
    { action: "update", subject: "Item" },
    { action: "delete", subject: "Item" },
    { action: "export", subject: "Item" },
    { action: "import", subject: "Item" },
    { action: "manage", subject: "Item" },

    // Location
    { action: "create", subject: "Location" },
    { action: "read", subject: "Location" },
    { action: "update", subject: "Location" },
    { action: "delete", subject: "Location" },
    { action: "manage", subject: "Location" },

    // Patient
    { action: "create", subject: "Patient" },
    { action: "read", subject: "Patient" },
    { action: "update", subject: "Patient" },
    { action: "delete", subject: "Patient" },
    { action: "manage", subject: "Patient" },

    // Role
    { action: "create", subject: "Role" },
    { action: "read", subject: "Role" },
    { action: "update", subject: "Role" },
    { action: "delete", subject: "Role" },
    { action: "manage", subject: "Role" },

    // Service
    { action: "create", subject: "Service" },
    { action: "read", subject: "Service" },
    { action: "update", subject: "Service" },
    { action: "delete", subject: "Service" },
    { action: "manage", subject: "Service" },

    // Treatment
    { action: "create", subject: "Treatment" },
    { action: "read", subject: "Treatment" },
    { action: "update", subject: "Treatment" },
    { action: "delete", subject: "Treatment" },
    { action: "manage", subject: "Treatment" },

    // User
    { action: "create", subject: "User" },
    { action: "read", subject: "User" },
    { action: "update", subject: "User" },
    { action: "delete", subject: "User" },
    { action: "manage", subject: "User" },

    // Invoice
    { action: "create", subject: "Invoice" },
    { action: "read", subject: "Invoice" },
    { action: "update", subject: "Invoice" },
    { action: "delete", subject: "Invoice" },
    { action: "manage", subject: "Invoice" },

    // Report
    { action: "read", subject: "Report" },
  ];

  for (const permission of permissions) {
    const existing = await prisma.permission.findFirst({
      where: {
        action: permission.action,
        subject: permission.subject,
      },
    });

    if (!existing) {
      await prisma.permission.create({
        data: permission,
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
