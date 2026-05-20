import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const getAllBatches = async () => {
  const batches = await prisma.batch.findMany({
    orderBy: { year: "asc" },
    include: {
      _count: {
        select: { students: { where: { status: "APPROVED" } } },
      },
    },
  });

  return batches.map((batch) => ({
    id: batch.id,
    year: batch.year,
    name: batch.name,
    description: batch.description,
    banner: batch.banner,
    memberCount: batch._count.students,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  }));
};

const getBatchByYear = async (year: string) => {
  const batch = await prisma.batch.findUnique({
    where: { year },
    include: {
      students: {
        where: { status: "APPROVED" },
        include: { user: { select: { email: true } } },
      },
      galleryImages: true,
    },
  });

  if (!batch) {
    throw new AppError(404, "Batch not found!");
  }

  // Calculate statistics
  const totalMembers = batch.students.length;
  const scienceCount = batch.students.filter((s) => s.group === "SCIENCE").length;
  const humanitiesCount = batch.students.filter((s) => s.group === "HUMANITIES").length;
  const commerceCount = batch.students.filter((s) => s.group === "COMMERCE").length;

  const professionMap: Record<string, number> = {};
  batch.students.forEach((s) => {
    const prof = s.currentProfession || "Unknown";
    professionMap[prof] = (professionMap[prof] || 0) + 1;
  });

  const statistics = {
    totalMembers,
    groups: {
      SCIENCE: scienceCount,
      HUMANITIES: humanitiesCount,
      COMMERCE: commerceCount,
    },
    professions: Object.entries(professionMap).map(([name, count]) => ({
      name,
      count,
    })),
  };

  return {
    batchInfo: {
      id: batch.id,
      year: batch.year,
      name: batch.name,
      description: batch.description,
      banner: batch.banner,
    },
    members: batch.students,
    gallery: batch.galleryImages,
    statistics,
  };
};

const createBatch = async (payload: any) => {
  const existingBatch = await prisma.batch.findUnique({
    where: { year: payload.year },
  });

  if (existingBatch) {
    throw new AppError(400, "A batch with this graduation year already exists!");
  }

  return await prisma.batch.create({
    data: {
      year: payload.year,
      name: payload.name || `SSC ${payload.year}`,
      description: payload.description || "",
      banner: payload.banner || "",
    },
  });
};

const updateBatch = async (year: string, payload: any) => {
  const batch = await prisma.batch.findUnique({
    where: { year },
  });

  if (!batch) {
    throw new AppError(404, "Batch not found!");
  }

  return await prisma.batch.update({
    where: { year },
    data: {
      name: payload.name,
      description: payload.description,
      banner: payload.banner,
    },
  });
};

export const BatchService = {
  getAllBatches,
  getBatchByYear,
  createBatch,
  updateBatch,
};
