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

const getContactMessages = async () => {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      batch: true,
      resolvedBy: { select: { email: true } },
    },
  });
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

const getAllFeedbacks = async () => {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
  });
};

export const FeedbackService = {
  createContactMessage,
  resolveContactMessage,
  getContactMessages,
  submitFeedback,
  getAllFeedbacks,
};
