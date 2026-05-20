import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { sendEmail, getNoticeTemplate } from "../../utils/sendEmail";

const getAllNotices = async (filters: any) => {
  const whereConditions: any = {};

  // If not admin, only show notices that are already scheduled/published
  if (!filters.isAdmin) {
    whereConditions.OR = [
      { scheduledAt: null },
      { scheduledAt: { lte: new Date() } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.notice.findMany({
    where: whereConditions,
    include: {
      createdBy: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
    skip,
    take: limit,
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  const total = await prisma.notice.count({
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

const getNoticeById = async (id: string) => {
  const notice = await prisma.notice.findUnique({
    where: { id },
    include: {
      createdBy: {
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
  });

  if (!notice) {
    throw new AppError(404, "Notice not found!");
  }

  return notice;
};

const createNotice = async (userId: string, payload: any) => {
  const notice = await prisma.notice.create({
    data: {
      title: payload.title,
      content: payload.content,
      isPinned: payload.isPinned === true,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
      sendEmailBroadcast: payload.sendEmailBroadcast === true,
      createdById: userId,
    },
  });

  // If broadcast is enabled, send email to all approved students
  if (payload.sendEmailBroadcast) {
    const students = await prisma.student.findMany({
      where: { status: "APPROVED" },
      include: { user: true },
    });

    const emailPromises = students.map((std) => {
      return sendEmail(
        std.user.email,
        `Notice: ${notice.title}`,
        getNoticeTemplate(notice.title, notice.content)
      ).catch((err) => console.error(`Failed to broadcast notice to ${std.user.email}`, err));
    });

    await Promise.all(emailPromises);
  }

  return notice;
};

const updateNotice = async (id: string, payload: any) => {
  const notice = await prisma.notice.findUnique({
    where: { id },
  });

  if (!notice) {
    throw new AppError(404, "Notice not found!");
  }

  return await prisma.notice.update({
    where: { id },
    data: {
      title: payload.title,
      content: payload.content,
      isPinned: payload.isPinned,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
      sendEmailBroadcast: payload.sendEmailBroadcast,
    },
  });
};

const deleteNotice = async (id: string) => {
  const notice = await prisma.notice.findUnique({
    where: { id },
  });

  if (!notice) {
    throw new AppError(404, "Notice not found!");
  }

  await prisma.notice.delete({
    where: { id },
  });

  return true;
};

export const NoticeService = {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};
