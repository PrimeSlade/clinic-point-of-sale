import prisma from "../../src/config/prisma.client";

async function main() {
  console.log("Starting data seed...");

  // Get the location created in user.seed.ts
  const location = await prisma.location.findFirst({
    where: { name: "Main Branch" },
  });

  if (!location) {
    throw new Error("Location not found. Please run user-seed first.");
  }

  console.log(`Using location: ${location.name} (ID: ${location.id})`);

  // 1. Create Services
  console.log("\n📋 Creating services...");
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "General Consultation",
        retailPrice: 15000,
      },
    }),
    prisma.service.create({
      data: {
        name: "X-Ray Examination",
        retailPrice: 25000,
      },
    }),
    prisma.service.create({
      data: {
        name: "Blood Test",
        retailPrice: 20000,
      },
    }),
  ]);
  console.log(`✓ Created ${services.length} services`);

  // 2. Create Items with ItemUnits
  console.log("\n💊 Creating items...");
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: "Paracetamol",
        category: "Medicine",
        expiryDate: new Date("2026-12-31"),
        description: "Pain reliever and fever reducer",
        locationId: location.id,
        itemUnits: {
          createMany: {
            data: [
              {
                unitType: "pkg",
                rate: 10,
                quantity: 10,
                purchasePrice: 50,
              },
              {
                unitType: "cap",
                rate: 10,
                quantity: 100,
                purchasePrice: 5,
              },
              {
                unitType: "pcs",
                rate: 1,
                quantity: 1000,
                purchasePrice: 0.5,
              },
            ],
          },
        },
      },
      include: { itemUnits: true },
    }),
    prisma.item.create({
      data: {
        name: "Amoxicillin",
        category: "Antibiotic",
        expiryDate: new Date("2026-06-30"),
        description: "Antibiotic for bacterial infections",
        locationId: location.id,
        itemUnits: {
          createMany: {
            data: [
              {
                unitType: "pkg",
                rate: 10,
                quantity: 10,
                purchasePrice: 150,
              },
              {
                unitType: "cap",
                rate: 10,
                quantity: 100,
                purchasePrice: 15,
              },
              {
                unitType: "pcs",
                rate: 1,
                quantity: 1000,
                purchasePrice: 1.5,
              },
            ],
          },
        },
      },
      include: { itemUnits: true },
    }),
    prisma.item.create({
      data: {
        name: "Vitamin C",
        category: "Supplement",
        expiryDate: new Date("2027-03-31"),
        description: "Immune system support",
        locationId: location.id,
        itemUnits: {
          createMany: {
            data: [
              {
                unitType: "pkg",
                rate: 10,
                quantity: 10,
                purchasePrice: 100,
              },
              {
                unitType: "cap",
                rate: 10,
                quantity: 100,
                purchasePrice: 10,
              },
              {
                unitType: "pcs",
                rate: 1,
                quantity: 1000,
                purchasePrice: 1,
              },
            ],
          },
        },
      },
      include: { itemUnits: true },
    }),
  ]);
  console.log(`✓ Created ${items.length} items with units`);

  // 3. Create Phone Numbers for Patients
  console.log("\n📞 Creating phone numbers for patients...");
  const patientPhone1 = await prisma.phoneNumber.create({
    data: { number: "+959111111111" },
  });
  const patientPhone2 = await prisma.phoneNumber.create({
    data: { number: "+959222222222" },
  });
  console.log("✓ Created patient phone numbers");

  // 4. Create Patients
  console.log("\n🏥 Creating patients...");
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: "Aung Aung",
        gender: "male",
        dateOfBirth: new Date("1990-05-15"),
        address: "123 Main Street, Yangon",
        email: "aung@email.com",
        patientStatus: "new_patient",
        patientCondition: "disable",
        patientType: "out",
        department: "general",
        phoneNumberId: patientPhone1.id,
        locationId: location.id,
      },
      include: {
        phoneNumber: true,
        location: true,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Ma Ma",
        gender: "female",
        dateOfBirth: new Date("1995-08-20"),
        address: "456 Market Road, Mandalay",
        email: "mama@email.com",
        patientStatus: "follow_up",
        patientCondition: "pregnant_woman",
        patientType: "in",
        department: "og",
        phoneNumberId: patientPhone2.id,
        locationId: location.id,
      },
      include: {
        phoneNumber: true,
        location: true,
      },
    }),
  ]);
  console.log(`✓ Created ${patients.length} patients`);

  // 5. Create Phone Numbers for Doctors
  console.log("\n📞 Creating phone numbers for doctors...");
  const doctorPhone1 = await prisma.phoneNumber.create({
    data: { number: "+959333333333" },
  });
  const doctorPhone2 = await prisma.phoneNumber.create({
    data: { number: "+959444444444" },
  });
  console.log("✓ Created doctor phone numbers");

  // 6. Create Doctors
  console.log("\n👨‍⚕️ Creating doctors...");
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: "Dr. Kyaw Kyaw",
        email: "dr.kyaw@hospital.com",
        commission: 15.5,
        address: "Medical Center, Yangon",
        description: "General Practitioner with 10 years experience",
        phoneNumberId: doctorPhone1.id,
        locationId: location.id,
      },
      include: {
        phoneNumber: true,
        location: true,
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. Thin Thin",
        email: "dr.thin@hospital.com",
        commission: 20.0,
        address: "Women's Health Clinic, Mandalay",
        description: "OB/GYN Specialist",
        phoneNumberId: doctorPhone2.id,
        locationId: location.id,
      },
      include: {
        phoneNumber: true,
        location: true,
      },
    }),
  ]);
  console.log(`✓ Created ${doctors.length} doctors`);

  // 7. Create Treatments
  console.log("\n💉 Creating treatments...");
  const treatments = await Promise.all([
    prisma.treatment.create({
      data: {
        doctorId: doctors[0].id,
        patientId: patients[0].id,
        investigation: "Blood pressure check, temperature measurement",
        diagnosis: "Common cold with mild fever",
        treatment: "Prescribed paracetamol and rest",
      },
      include: {
        doctor: true,
        patient: true,
      },
    }),
    prisma.treatment.create({
      data: {
        doctorId: doctors[1].id,
        patientId: patients[1].id,
        investigation: "Ultrasound scan, blood test",
        diagnosis: "Normal pregnancy progression - 2nd trimester",
        treatment: "Prenatal vitamins and regular checkup scheduled",
      },
      include: {
        doctor: true,
        patient: true,
      },
    }),
  ]);
  console.log(`✓ Created ${treatments.length} treatments`);

  // 8. Create Categories
  console.log("\n📂 Creating expense categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Utilities",
        description: "Electricity, water, internet bills",
        locationId: location.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Maintenance",
        description: "Equipment and facility maintenance",
        locationId: location.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Supplies",
        description: "Medical and office supplies",
        locationId: location.id,
      },
    }),
  ]);
  console.log(`✓ Created ${categories.length} categories`);

  // 9. Create Expenses
  console.log("\n💰 Creating expenses...");
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        name: "Monthly Electricity Bill",
        amount: 150000,
        date: new Date("2025-10-01"),
        description: "Electricity bill for October 2025",
        locationId: location.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.expense.create({
      data: {
        name: "Medical Equipment Maintenance",
        amount: 250000,
        date: new Date("2025-10-05"),
        description: "Quarterly maintenance for medical equipment",
        locationId: location.id,
        categoryId: categories[1].id,
      },
    }),
    prisma.expense.create({
      data: {
        name: "Office Supplies Purchase",
        amount: 75000,
        date: new Date("2025-10-08"),
        description: "Paper, pens, folders and other office supplies",
        locationId: location.id,
        categoryId: categories[2].id,
      },
    }),
  ]);
  console.log(`✓ Created ${expenses.length} expenses`);

  console.log("\n✅ Data seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Services: ${services.length}`);
  console.log(`   - Items: ${items.length}`);
  console.log(`   - Patients: ${patients.length}`);
  console.log(`   - Doctors: ${doctors.length}`);
  console.log(`   - Treatments: ${treatments.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Expenses: ${expenses.length}`);
}

main()
  .catch((e) => {
    console.error("Error during data seeding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
