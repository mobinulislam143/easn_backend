import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Default Batches
  const years = ["2020", "2021", "2022"];
  const createdBatches = [];

  for (const year of years) {
    const existingBatch = await prisma.batch.findUnique({
      where: { year },
    });

    if (!existingBatch) {
      const batch = await prisma.batch.create({
        data: {
          year,
          name: `SSC ${year}`,
          description: `Eidgah Adarsha Shiksha Niketon SSC Batch ${year} group.`,
          banner: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000",
        },
      });
      console.log(`Created Batch: ${batch.name}`);
      createdBatches.push(batch);
    } else {
      console.log(`Batch ${year} already exists.`);
      createdBatches.push(existingBatch);
    }
  }

  // 2. Create or Update Default Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "mahi@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingAdmin) {
    const admin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
      },
    });
    console.log(`Updated Admin User credentials to: ${admin.email}`);
  } else {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isVerified: true,
      },
    });
    console.log(`Created Admin User: ${admin.email}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
