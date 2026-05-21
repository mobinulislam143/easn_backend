import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { getBatchAdminContext } from "../../helpers/batchAdmin";

const publishedFilter = {
  OR: [{ status: "PUBLISHED" as const }, { status: null }],
};

const getAllPhotos = async (filters: any) => {
  const { type, batchId, eventId } = filters;

  const andConditions: any[] = [publishedFilter];

  if (type) andConditions.push({ type });
  if (batchId) andConditions.push({ batchId });
  if (eventId) andConditions.push({ eventId });

  const whereConditions = { AND: andConditions };

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 12;
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

  const total = await prisma.gallery.count({ where: whereConditions });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data,
  };
};

const getPhotoById = async (id: string) => {
  const photo = await prisma.gallery.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
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
  });

  if (!photo) throw new AppError(404, "Photo not found!");
  return photo;
};

const uploadPhoto = async (userId: string, payload: any, userRole: string) => {
  let status: "PENDING" | "PUBLISHED" = "PUBLISHED";
  let batchId: string | null = payload.batchId || null;

  if (userRole === "STUDENT") {
    status = "PENDING";
    // Always use student's own batchId for pending approval routing
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student) batchId = student.batchId;
  }

  return await prisma.gallery.create({
    data: {
      title: payload.title,
      imageUrl: payload.imageUrl,
      type: payload.type || "BATCH_MEMORIES",
      batchId,
      eventId: payload.eventId || null,
      uploadedById: userId,
      status,
    },
  });
};

const deletePhoto = async (id: string, userId: string, userRole: string) => {
  const photo = await prisma.gallery.findUnique({ where: { id } });
  if (!photo) throw new AppError(404, "Photo not found!");

  if (photo.uploadedById !== userId && userRole !== "SUPER_ADMIN" && userRole !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to delete this photo.");
  }

  await prisma.gallery.delete({ where: { id } });
  return true;
};

const getPendingPhotos = async (batchId?: string) => {
  const where: any = { status: "PENDING" };
  if (batchId) where.batchId = batchId;

  return await prisma.gallery.findMany({
    where,
    include: {
      uploadedBy: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const assertCanModeratePhoto = async (
  photo: { batchId: string | null },
  userId: string,
  userRole: string
) => {
  if (userRole === "SUPER_ADMIN") return;
  if (userRole !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to moderate this photo.");
  }
  const { batchId } = await getBatchAdminContext(userId);
  if (photo.batchId !== batchId) {
    throw new AppError(403, "You can only moderate photos from your own batch.");
  }
};

const approvePhoto = async (id: string, userId: string, userRole: string) => {
  const photo = await prisma.gallery.findUnique({ where: { id } });
  if (!photo) throw new AppError(404, "Photo not found!");
  await assertCanModeratePhoto(photo, userId, userRole);
  return await prisma.gallery.update({ where: { id }, data: { status: "PUBLISHED" } });
};

const rejectPhoto = async (id: string, userId: string, userRole: string) => {
  const photo = await prisma.gallery.findUnique({ where: { id } });
  if (!photo) throw new AppError(404, "Photo not found!");
  await assertCanModeratePhoto(photo, userId, userRole);
  return await prisma.gallery.update({ where: { id }, data: { status: "REJECTED" } });
};

export const GalleryService = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  deletePhoto,
  getPendingPhotos,
  approvePhoto,
  rejectPhoto,
};
