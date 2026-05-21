import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const createContactMessage = async (payload: any) => {
  const { name, email, subject, message, type, batchId } = payload;

  if (!name || !email || !subject || !message) {
    throw new AppError(400, "All contact fields are required.");
  }

  return await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
      type: type || "PUBLIC", // PUBLIC, BATCH_ADMIN, COMPLAINT
      batchId: batchId || null,
    },
  });
};

const resolveContactMessage = async (id: string, adminId: string) => {
  const contact = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(404, "Contact message not found!");
  }

  return await prisma.contactMessage.update({
    where: { id },
    data: {
      resolved: true,
      resolvedById: adminId,
    },
  });
};

const getContactMessages = async (filters?: any) => {
  const page = Number(filters?.page) || 1;
  const limit = Number(filters?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.contactMessage.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
    include: {
      batch: true,
      resolvedBy: { select: { email: true } },
    },
    skip,
    take: limit,
  });

  const total = await prisma.contactMessage.count({
    where: { resolved: false },
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

const submitFeedback = async (userId: string | null, payload: any) => {
  const { rating, message, suggestions } = payload;

  if (!rating || !message) {
    throw new AppError(400, "Rating and message are required.");
  }

  return await prisma.feedback.create({
    data: {
      rating: Number(rating),
      message,
      suggestions: suggestions || "",
      userId: userId || null,
    },
  });
};

const getAllFeedbacks = async (filters?: any) => {
  const page = Number(filters?.page) || 1;
  const limit = Number(filters?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
    skip,
    take: limit,
  });

  const total = await prisma.feedback.count();

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

export const FeedbackService = {
  createContactMessage,
  resolveContactMessage,
  getContactMessages,
  submitFeedback,
  getAllFeedbacks,
};
