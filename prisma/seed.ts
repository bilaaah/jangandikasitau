import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  BusinessRole,
  OrderStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();
const BUSINESS_NAME = "Sweet Delights Bakery (Demo)";

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

async function ensureDemoOrder(input: {
  businessId: string;
  customerName: string;
  status: OrderStatus;
  requiredDeliveryDate: Date;
  productId: string;
  quantity: number;
  notes?: string;
}) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { businessId: input.businessId, customerName: input.customerName },
      include: { items: true },
    });
    const data = {
      status: input.status,
      requiredDeliveryDate: input.requiredDeliveryDate,
      notes: input.notes ?? null,
    };
    const order = existing
      ? await tx.order.update({ where: { id: existing.id }, data })
      : await tx.order.create({
          data: { businessId: input.businessId, customerName: input.customerName, ...data },
        });

    const existingItem = existing?.items[0];
    if (existingItem) {
      await tx.orderItem.update({
        where: { id: existingItem.id },
        data: { productId: input.productId, quantity: input.quantity },
      });
      await tx.orderItem.deleteMany({
        where: { orderId: order.id, id: { not: existingItem.id } },
      });
    } else {
      await tx.orderItem.create({
        data: { orderId: order.id, productId: input.productId, quantity: input.quantity },
      });
    }
  });
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
    email: "staff@sweetdelights.dev",
    name: "Demo Staff",
    businessId: business.id,
    role: BusinessRole.STAFF,
  });
  await ensureDemoUser({
    email: "owner@sweetdelights.dev",
    name: "Demo Owner",
    businessId: business.id,
    role: BusinessRole.OWNER,
  });

  const [butter, darkChocolate, eggs, flour, yeast] = await Promise.all([
    ensureMaterial(business.id, { name: "Butter", unit: "kg", currentStock: 20 }),
    ensureMaterial(business.id, { name: "Dark Chocolate", unit: "kg", currentStock: 15 }),
    ensureMaterial(business.id, { name: "Eggs", unit: "pcs", currentStock: 200 }),
    ensureMaterial(business.id, { name: "Flour", unit: "kg", currentStock: 50 }),
    ensureMaterial(business.id, { name: "Yeast", unit: "kg", currentStock: 8 }),
  ]);

  const [, sourdough, weddingCake] = await Promise.all([
    ensureProduct(business.id, {
      name: "Chocolate Brownie Box (24 pcs)",
      description: "Kotak berisi 24 brownies cokelat premium.",
      workerHoursPerUnit: 2,
      machineHoursPerUnit: 1,
      billOfMaterials: [
        { materialId: flour.id, quantityPerUnit: 0.5 },
        { materialId: butter.id, quantityPerUnit: 0.3 },
        { materialId: darkChocolate.id, quantityPerUnit: 0.4 },
        { materialId: eggs.id, quantityPerUnit: 4 },
      ],
    }),
    ensureProduct(business.id, {
      name: "Sourdough Loaf",
      description: "Roti sourdough artisan dengan fermentasi alami.",
      workerHoursPerUnit: 3,
      machineHoursPerUnit: 1.5,
      billOfMaterials: [
        { materialId: flour.id, quantityPerUnit: 0.6 },
        { materialId: yeast.id, quantityPerUnit: 0.02 },
      ],
    }),
    ensureProduct(business.id, {
      name: "Custom Wedding Cake",
      description: "Kue pengantin fondant bertingkat sesuai pesanan.",
      workerHoursPerUnit: 8,
      machineHoursPerUnit: 2,
      billOfMaterials: [
        { materialId: flour.id, quantityPerUnit: 2 },
        { materialId: butter.id, quantityPerUnit: 0.5 },
        { materialId: eggs.id, quantityPerUnit: 12 },
      ],
    }),
  ]);

  await Promise.all([
    ensureWorker(business.id, "Budi (Decorator)", 8),
    ensureWorker(business.id, "Rina (Part-time)", 4),
    ensureWorker(business.id, "Siti (Head Baker)", 8),
  ]);
  await Promise.all([
    ensureMachine(business.id, "Commercial Oven 1", 10),
    ensureMachine(business.id, "Commercial Oven 2", 8),
  ]);

  const today = new Date();
  await ensureDemoOrder({
    businessId: business.id,
    customerName: "PT Amanah",
    status: OrderStatus.DRAFT,
    requiredDeliveryDate: getDeliveryDateAfterWorkDays(today, 4),
    productId: sourdough.id,
    quantity: 10,
    notes: "custom kartu ucapan",
  });
  await ensureDemoOrder({
    businessId: business.id,
    customerName: "PT ibu imut",
    status: OrderStatus.CONFIRMED,
    requiredDeliveryDate: getDeliveryDateAfterWorkDays(today, 14),
    productId: sourdough.id,
    quantity: 10,
  });
  await ensureDemoOrder({
    businessId: business.id,
    customerName: "Budi Wedding (Existing)",
    status: OrderStatus.CANCELLED,
    requiredDeliveryDate: new Date("2026-11-01T17:00:00.000Z"),
    productId: weddingCake.id,
    quantity: 2,
  });
  await ensureDemoOrder({
    businessId: business.id,
    customerName: "Demo What-if",
    status: OrderStatus.DRAFT,
    requiredDeliveryDate: getDeliveryDateAfterWorkDays(today, 8),
    productId: sourdough.id,
    quantity: 44,
  });

  console.log(`Data demo berhasil disiapkan untuk ${business.name}.`);
  console.log("Seed tidak menghapus data usaha atau pesanan lain.");
  console.log("Jumlah fixture: 1 usaha, 3 produk+BOM, 3 pekerja, 2 mesin, 5 bahan baku, 4 pesanan.");
}

main()
  .catch((error: unknown) => {
    console.error("Gagal menjalankan seed data demo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
  
