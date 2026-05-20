import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const getAllPhotos = async (filters: any) => {
  const { type, batchId, eventId } = filters;
  const whereConditions: any = {};

  if (type) {
    whereConditions.type = type;
  }
  if (batchId) {
    whereConditions.batchId = batchId;
  }
  if (eventId) {
    whereConditions.eventId = eventId;
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.gallery.findMany({
    where: whereConditions,
    include: {
      uploadedBy: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              email: true,
              studentProfile: { select: { fullName: true, profileImage: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.gallery.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const uploadPhoto = async (userId: string, payload: any) => {
  return await prisma.gallery.create({
    data: {
      title: payload.title,
      imageUrl: payload.imageUrl,
      type: payload.type, // REUNION, EVENT, BATCH_MEMORIES
      batchId: payload.batchId || null,
      eventId: payload.eventId || null,
      uploadedById: userId,
    },
  });
};

const deletePhoto = async (id: string, userId: string, userRole: string) => {
  const photo = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!photo) {
    throw new AppError(404, "Photo not found!");
  }

  // Author, SUPER_ADMIN or BATCH_ADMIN can delete
  if (photo.uploadedById !== userId && userRole !== "SUPER_ADMIN" && userRole !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to delete this photo.");
  }

  await prisma.gallery.delete({
    where: { id },
  });

  return true;
};

export const GalleryService = {
  getAllPhotos,
  uploadPhoto,
  deletePhoto,
};
