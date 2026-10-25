import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { BusinessRole, PrismaClient } from "@prisma/client";

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
  ] = await Promise.all([
    ensureMaterial(business.id, { name: "Hardbox Rigid Satin", unit: "box", currentStock: 250 }),
    ensureMaterial(business.id, { name: "Pita Satin Emas", unit: "meter", currentStock: 600 }),
    ensureMaterial(business.id, { name: "Jar Kaca 350ml", unit: "pcs", currentStock: 800 }),
    ensureMaterial(business.id, { name: "Dark Cocoa Powder", unit: "kg", currentStock: 80 }),
    ensureMaterial(business.id, { name: "Unsalted Butter Anchor", unit: "kg", currentStock: 60 }),
    ensureMaterial(business.id, { name: "Brownie Packaging Box", unit: "box", currentStock: 500 }),
    ensureMaterial(business.id, { name: "Premium Bread Flour", unit: "kg", currentStock: 120 }),
    ensureMaterial(business.id, { name: "Wild Yeast Starter", unit: "kg", currentStock: 30 }),
  ]);

  await Promise.all([
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
  ]);

  await Promise.all([
    ensureWorker(business.id, "Budi Santoso", 8),
    ensureWorker(business.id, "Chef Aris", 8),
    ensureWorker(business.id, "Siti Rahma", 8),
    ensureWorker(business.id, "Dita", 6),
    ensureMachine(business.id, "Oven Deck Gas 3-Deck", 10),
    ensureMachine(business.id, "Mesin Band Sealer", 8),
  ]);

  console.log(`Data demo berhasil disiapkan untuk ${business.name}.`);
  console.log("Seed tidak menghapus data usaha atau pesanan lain.");
  console.log("Jumlah fixture: 1 usaha, 3 produk+BOM, 4 pekerja, 2 mesin, 8 bahan baku.");
}

main()
  .catch((error: unknown) => {
    console.error("Gagal menjalankan seed data demo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
