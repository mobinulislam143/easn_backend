import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../src/generated/prisma";
import { ensureSystemAdmin } from "../src/app/helpers/ensureSystemAdmin";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  const years = ["2020", "2021", "2022"];

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
          banner:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000",
        },
      });
      console.log(`Created Batch: ${batch.name}`);
    } else {
      console.log(`Batch ${year} already exists.`);
    }
  }

  await ensureSystemAdmin();

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
