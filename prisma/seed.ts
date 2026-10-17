// prisma/seed.ts
//
// Development seed script.
// Creates one Business with one Owner user and a sample set of resources
// so the team can run Milestone 1 without needing real data entry.
//
// Run with: npm run db:seed
// After running, copy the logged businessId into .env.local as DEV_BUSINESS_ID.
//
// This script is ONLY for local development. Do NOT run in production.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding development database...");

  // ---------------------------------------------------------------------------
  // Clean existing seed data (safe for repeated runs)
  // ---------------------------------------------------------------------------
  // Delete in reverse dependency order to respect FK constraints
  await prisma.bottleneck.deleteMany();
  await prisma.capacityAnalysis.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productMaterial.deleteMany();
  await prisma.material.deleteMany();
  await prisma.product.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.userBusiness.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  console.log("  ✓ Cleared existing seed data");

  // ---------------------------------------------------------------------------
  // Create business
  // ---------------------------------------------------------------------------
  const business = await prisma.business.create({
    data: {
      name: "Sweet Delights Bakery (Demo)",
      type: "Bakery",
    },
  });

  console.log(`  ✓ Created business: ${business.name}`);
  console.log(`\n  ✨ DEV_BUSINESS_ID=${business.id}\n`);

  // ---------------------------------------------------------------------------
  // Create owner user
  // ---------------------------------------------------------------------------
  const user = await prisma.user.create({
    data: {
      email: "owner@sweetdelights.dev",
      name: "Demo Owner",
    },
  });

  await prisma.userBusiness.create({
    data: {
      userId: user.id,
      businessId: business.id,
      role: "OWNER",
    },
  });

  console.log(`  ✓ Created user: ${user.email}`);

  // ---------------------------------------------------------------------------
  // Create materials
  // ---------------------------------------------------------------------------
  const [flour, butter, chocolate, eggs] = await Promise.all([
    prisma.material.create({
      data: { businessId: business.id, name: "Flour", unit: "kg", currentStock: 50 },
    }),
    prisma.material.create({
      data: { businessId: business.id, name: "Butter", unit: "kg", currentStock: 20 },
    }),
    prisma.material.create({
      data: { businessId: business.id, name: "Dark Chocolate", unit: "kg", currentStock: 15 },
    }),
    prisma.material.create({
      data: { businessId: business.id, name: "Eggs", unit: "pcs", currentStock: 200 },
    }),
  ]);

  console.log("  ✓ Created 4 materials");

  // ---------------------------------------------------------------------------
  // Create products
  // ---------------------------------------------------------------------------
  const [weddingCake, brownies] = await Promise.all([
    prisma.product.create({
      data: {
        businessId: business.id,
        name: "Custom Wedding Cake",
        description: "Multi-tier fondant wedding cake",
        workerHoursPerUnit: 8,   // 8 worker-hours per cake
        machineHoursPerUnit: 2,  // 2 machine-hours (oven time) per cake
        materials: {
          create: [
            { materialId: flour.id, quantityPerUnit: 2 },    // 2 kg flour per cake
            { materialId: butter.id, quantityPerUnit: 0.5 }, // 0.5 kg butter per cake
            { materialId: eggs.id, quantityPerUnit: 12 },    // 12 eggs per cake
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        businessId: business.id,
        name: "Chocolate Brownie Box (24 pcs)",
        description: "Box of 24 premium chocolate brownies",
        workerHoursPerUnit: 2,   // 2 worker-hours per box
        machineHoursPerUnit: 1,  // 1 machine-hour (oven time) per box
        materials: {
          create: [
            { materialId: flour.id, quantityPerUnit: 0.5 },
            { materialId: butter.id, quantityPerUnit: 0.3 },
            { materialId: chocolate.id, quantityPerUnit: 0.4 },
            { materialId: eggs.id, quantityPerUnit: 4 },
          ],
        },
      },
    }),
  ]);

  console.log("  ✓ Created 2 products");

  // ---------------------------------------------------------------------------
  // Create workers
  // ---------------------------------------------------------------------------
  await Promise.all([
    prisma.worker.create({
      data: { businessId: business.id, name: "Siti (Head Baker)", dailyAvailableHours: 8 },
    }),
    prisma.worker.create({
      data: { businessId: business.id, name: "Budi (Decorator)", dailyAvailableHours: 8 },
    }),
    prisma.worker.create({
      data: { businessId: business.id, name: "Rina (Part-time)", dailyAvailableHours: 4 },
    }),
  ]);

  console.log("  ✓ Created 3 workers (20 total daily hours)");

  // ---------------------------------------------------------------------------
  // Create machines
  // ---------------------------------------------------------------------------
  await Promise.all([
    prisma.machine.create({
      data: { businessId: business.id, name: "Commercial Oven 1", dailyAvailableHours: 10 },
    }),
    prisma.machine.create({
      data: { businessId: business.id, name: "Commercial Oven 2", dailyAvailableHours: 8 },
    }),
  ]);

  console.log("  ✓ Created 2 machines (18 total daily hours)");

  // ---------------------------------------------------------------------------
  // Create a sample active order (to test commitment deduction)
  // ---------------------------------------------------------------------------
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.order.create({
    data: {
      businessId: business.id,
      customerName: "Budi Wedding (Existing)",
      status: "CONFIRMED",
      requiredDeliveryDate: nextWeek,
      items: {
        create: [{ productId: weddingCake.id, quantity: 2 }],
      },
    },
  });

  console.log("  ✓ Created 1 sample active order (2x Wedding Cake, CONFIRMED)");
  console.log("\n✅ Seed complete!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  NEXT STEP: Add this to your .env.local file:");
  console.log(`  DEV_BUSINESS_ID="${business.id}"`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
