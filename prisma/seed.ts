import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  BusinessRole,
  OrderStatus,
  PrismaClient,
} from "@prisma/client";
import { runCapacityEngine } from "../src/engine/capacity/calculator";

const prisma = new PrismaClient();
const BUSINESS_NAME = "SweetCrumbs Bakery";

async function ensureDemoUser(input: {
  email: string;
  name: string;
  businessId: string;
  role: BusinessRole;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  const initialPassword = existingUser?.hashedPassword
    ? undefined
    : randomBytes(18).toString("base64url");
  const hashedPassword = initialPassword
    ? await bcrypt.hash(initialPassword, 12)
    : undefined;

  let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  if (existingUser) {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { name: input.name, ...(hashedPassword ? { hashedPassword } : {}) },
    });
  } else {
    if (!hashedPassword) {
      throw new Error(`Kata sandi awal tidak berhasil dibuat untuk ${input.email}.`);
    }
    user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        hashedPassword,
      },
    });
  }
 
  await prisma.userBusiness.upsert({
    where: {
      userId_businessId: {
        userId: user.id,
        businessId: input.businessId,
      },
    },
    create: {
      userId: user.id,
      businessId: input.businessId,
      role: input.role,
    },
    update: { role: input.role },
  });

  console.log(`Akun ${input.role === BusinessRole.OWNER ? "Owner" : "Staff"}: ${input.email}`);
  if (initialPassword) {
    console.log(`Kata sandi awal (simpan sekarang): ${initialPassword}`);
  } else {
    console.log("Kata sandi akun yang sudah ada tidak diubah.");
  }
}

async function ensureMaterial(
  businessId: string,
  material: { name: string; unit: string; currentStock: number },
) {
  const existing = await prisma.material.findFirst({
    where: { businessId, name: material.name },
  });

  return existing
    ? prisma.material.update({
        where: { id: existing.id },
        data: { ...material, isActive: true },
      })
    : prisma.material.create({
        data: { businessId, ...material },
      });
}

async function ensureProduct(
  businessId: string,
  productInput: {
    name: string;
    description: string;
    workerHoursPerUnit: number;
    machineHoursPerUnit: number;
    billOfMaterials: { materialId: string; quantityPerUnit: number }[];
  },
) {
  const { billOfMaterials, ...productData } = productInput;
  const existing = await prisma.product.findFirst({
    where: { businessId, name: productData.name },
  });

  const product = existing
    ? await prisma.product.update({
        where: { id: existing.id },
        data: { ...productData, isActive: true },
      })
    : await prisma.product.create({
        data: { businessId, ...productData },
      });

  for (const item of billOfMaterials) {
    await prisma.productMaterial.upsert({
      where: {
        productId_materialId: {
          productId: product.id,
          materialId: item.materialId,
        },
      },
      create: {
        productId: product.id,
        materialId: item.materialId,
        quantityPerUnit: item.quantityPerUnit,
      },
      update: { quantityPerUnit: item.quantityPerUnit },
    });
  }

  await prisma.productMaterial.deleteMany({
    where: {
      productId: product.id,
      materialId: { notIn: billOfMaterials.map((item) => item.materialId) },
    },
  });

  return product;
}

async function ensureWorker(businessId: string, name: string, dailyAvailableHours: number) {
  const existing = await prisma.worker.findFirst({
    where: { businessId, name },
  });

  return existing
    ? prisma.worker.update({
        where: { id: existing.id },
        data: { dailyAvailableHours, isActive: true },
      })
    : prisma.worker.create({
        data: { businessId, name, dailyAvailableHours },
      });
}

async function ensureMachine(businessId: string, name: string, dailyAvailableHours: number) {
  const existing = await prisma.machine.findFirst({
    where: { businessId, name },
  });

  return existing
    ? prisma.machine.update({
        where: { id: existing.id },
        data: { dailyAvailableHours, isActive: true },
      })
    : prisma.machine.create({
        data: { businessId, name, dailyAvailableHours },
      });
}

function getDeliveryDateAfterWorkDays(startDate: Date, workDays: number) {
  const deliveryDate = new Date(startDate);
  let countedDays = 0;

  while (countedDays < workDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const weekday = deliveryDate.getDay();
    if (weekday >= 1 && weekday <= 5) countedDays++;
  }

  deliveryDate.setHours(17, 0, 0, 0);
  return deliveryDate;
}

async function seedAtRiskDemoOrder(
  businessId: string,
  productId: string,
  packagingMaterial: { id: string; currentStock: number; unit: string },
  workers: { id: string; dailyAvailableHours: number }[],
  machines: { id: string; dailyAvailableHours: number }[],
) {
  const analysisDate = new Date();
  const requiredDeliveryDate = getDeliveryDateAfterWorkDays(analysisDate, 5);
  const quantity = 300;
  const analysis = runCapacityEngine({
    newOrder: {
      quantity,
      productId,
      analysisDate,
      requiredDeliveryDate,
    },
    product: {
      workerHoursPerUnit: 0.45,
      machineHoursPerUnit: 0.1,
      materials: [{ materialId: packagingMaterial.id, quantityPerUnit: 1 }],
    },
    workforce: { workers },
    machinery: { machines },
    inventory: {
      materials: [
        {
          id: packagingMaterial.id,
          currentStock: packagingMaterial.currentStock,
          unit: packagingMaterial.unit,
        },
      ],
    },
    activeCommitments: {
      workerHoursCommitted: 0,
      machineHoursCommitted: 0,
      materialCommitments: [],
    },
  });

  if (analysis.status !== "AT_RISK") {
    throw new Error(
      `The 300-unit demo order must be AT_RISK, got ${analysis.status}.`,
    );
  }

  const customerName = "Demo AT_RISK - 300 gift boxes";
  const notes = "Demo fixture: 90% worker utilization with zero delivery buffer.";

  await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { businessId, customerName, notes },
      include: {
        items: true,
        capacityAnalyses: {
          orderBy: { analyzedAt: "desc" },
          take: 1,
        },
      },
    });

    const order = existing
      ? await tx.order.update({
          where: { id: existing.id },
          data: { status: OrderStatus.DRAFT, requiredDeliveryDate },
        })
      : await tx.order.create({
          data: {
            businessId,
            customerName,
            notes,
            status: OrderStatus.DRAFT,
            requiredDeliveryDate,
          },
        });

    const existingItem = existing?.items[0];
    if (existingItem) {
      await tx.orderItem.update({
        where: { id: existingItem.id },
        data: { productId, quantity },
      });
      await tx.orderItem.deleteMany({
        where: { orderId: order.id, id: { not: existingItem.id } },
      });
    } else {
      await tx.orderItem.create({
        data: { orderId: order.id, productId, quantity },
      });
    }

    const existingAnalysis = existing?.capacityAnalyses[0];
    if (existingAnalysis) {
      await tx.bottleneck.deleteMany({ where: { analysisId: existingAnalysis.id } });
      await tx.capacityAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          status: analysis.status,
          workerUtilizationPercent: analysis.workerAnalysis.utilizationPercent,
          machineUtilizationPercent: analysis.machineAnalysis.utilizationPercent,
          availableWorkDays: analysis.availableWorkDays,
          estimatedProductionDays: analysis.estimatedProductionDays,
          bufferDays: analysis.bufferDays,
          reasoning: analysis.reasoning,
          analyzedAt: analysisDate,
          bottlenecks: {
            create: analysis.bottlenecks.map((bottleneck) => ({
              resourceType: bottleneck.resourceType,
              resourceId: bottleneck.resourceId ?? null,
              severity: bottleneck.severity,
              description: bottleneck.description,
            })),
          },
        },
      });
    } else {
      await tx.capacityAnalysis.create({
        data: {
          orderId: order.id,
          status: analysis.status,
          workerUtilizationPercent: analysis.workerAnalysis.utilizationPercent,
          machineUtilizationPercent: analysis.machineAnalysis.utilizationPercent,
          availableWorkDays: analysis.availableWorkDays,
          estimatedProductionDays: analysis.estimatedProductionDays,
          bufferDays: analysis.bufferDays,
          reasoning: analysis.reasoning,
          analyzedAt: analysisDate,
          bottlenecks: {
            create: analysis.bottlenecks.map((bottleneck) => ({
              resourceType: bottleneck.resourceType,
              resourceId: bottleneck.resourceId ?? null,
              severity: bottleneck.severity,
              description: bottleneck.description,
            })),
          },
        },
      });
    }
  });

  console.log(
    `Skenario order demo tersimpan: ${quantity} unit, ${analysis.status} (${analysis.bottlenecks.length} bottleneck).`,
  );
}

async function main() {
  const existingBusiness = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });
  const business = existingBusiness
    ? await prisma.business.update({
        where: { id: existingBusiness.id },
        data: { type: "Bakery & Custom Gift" },
      })
    : await prisma.business.create({
        data: { name: BUSINESS_NAME, type: "Bakery & Custom Gift" },
      });

  await ensureDemoUser({
    email: "bilah@sweetcrumbs.id",
    name: "Bilah",
    businessId: business.id,
    role: BusinessRole.OWNER,
  });
  await ensureDemoUser({
    email: "staff@sweetcrumbs.id",
    name: "Demo Staff",
    businessId: business.id,
    role: BusinessRole.MEMBER,
  });

  const [
    hardbox,
    ribbon,
    glassJar,
    cocoa,
    butter,
    brownieBox,
    flour,
    yeastStarter,
    demoPackaging,
  ] = await Promise.all([
    ensureMaterial(business.id, { name: "Hardbox Rigid Satin", unit: "box", currentStock: 250 }),
    ensureMaterial(business.id, { name: "Pita Satin Emas", unit: "meter", currentStock: 600 }),
    ensureMaterial(business.id, { name: "Jar Kaca 350ml", unit: "pcs", currentStock: 800 }),
    ensureMaterial(business.id, { name: "Dark Cocoa Powder", unit: "kg", currentStock: 80 }),
    ensureMaterial(business.id, { name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60 }),
    ensureMaterial(business.id, { name: "Brownie Packaging Box", unit: "box", currentStock: 500 }),
    ensureMaterial(business.id, { name: "Premium Bread Flour", unit: "kg", currentStock: 120 }),
    ensureMaterial(business.id, { name: "Wild Yeast Starter", unit: "kg", currentStock: 30 }),
    ensureMaterial(business.id, { name: "Demo Gift Box Packaging", unit: "box", currentStock: 350 }),
  ]);

  const [, , , demoAtRiskProduct] = await Promise.all([
    ensureProduct(business.id, {
      name: "Custom Gift Boxes Lebaran (4 SKU Set)",
      description: "Paket hampers premium dengan hardbox satin, pita, dan jar.",
      workerHoursPerUnit: 1.5,
      machineHoursPerUnit: 0.8,
      billOfMaterials: [
        { materialId: hardbox.id, quantityPerUnit: 1 },
        { materialId: ribbon.id, quantityPerUnit: 2 },
        { materialId: glassJar.id, quantityPerUnit: 3 },
      ],
    }),
    ensureProduct(business.id, {
      name: "Signature Fudgy Brownies Box",
      description: "Brownies cokelat premium dalam kotak kemasan.",
      workerHoursPerUnit: 0.4,
      machineHoursPerUnit: 0.7,
      billOfMaterials: [
        { materialId: cocoa.id, quantityPerUnit: 0.25 },
        { materialId: butter.id, quantityPerUnit: 0.2 },
        { materialId: brownieBox.id, quantityPerUnit: 1 },
      ],
    }),
    ensureProduct(business.id, {
      name: "Artisan Sourdough Loaf",
      description: "Roti sourdough artisan dengan fermentasi alami.",
      workerHoursPerUnit: 0.6,
      machineHoursPerUnit: 1.2,
      billOfMaterials: [
        { materialId: flour.id, quantityPerUnit: 0.6 },
        { materialId: yeastStarter.id, quantityPerUnit: 0.15 },
      ],
    }),
    ensureProduct(business.id, {
      name: "Demo Rush Gift Box (300-unit AT_RISK)",
      description: "Skenario demo dengan utilisasi pekerja 90% dan buffer pengiriman nol.",
      workerHoursPerUnit: 0.45,
      machineHoursPerUnit: 0.1,
      billOfMaterials: [{ materialId: demoPackaging.id, quantityPerUnit: 1 }],
    }),
  ]);

  const demoWorkers = await Promise.all([
    ensureWorker(business.id, "Budi Santoso", 8),
    ensureWorker(business.id, "Chef Aris", 8),
    ensureWorker(business.id, "Siti Rahma", 8),
    ensureWorker(business.id, "Dita", 6),
  ]);
  const demoMachines = await Promise.all([
    ensureMachine(business.id, "Oven Deck Gas 3-Deck", 10),
    ensureMachine(business.id, "Mesin Band Sealer", 8),
  ]);

  await seedAtRiskDemoOrder(
    business.id,
    demoAtRiskProduct.id,
    demoPackaging,
    demoWorkers.map(({ id, dailyAvailableHours }) => ({ id, dailyAvailableHours })),
    demoMachines.map(({ id, dailyAvailableHours }) => ({ id, dailyAvailableHours })),
  );

  console.log(`Data demo berhasil disiapkan untuk ${business.name}.`);
  console.log("Seed tidak menghapus data usaha atau pesanan lain.");
  console.log("Jumlah fixture: 1 usaha, 4 produk+BOM, 4 pekerja, 2 mesin, 9 bahan baku, 1 order AT_RISK.");
}

main()
  .catch((error: unknown) => {
    console.error("Gagal menjalankan seed data demo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
