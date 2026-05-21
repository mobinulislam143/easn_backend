import prisma from "./prisma";
import AppError from "../errors/AppError";
import { getBatchAdminContext } from "./batchAdmin";

export const resolveReminderTargetBatch = async (
  userId: string,
  role: string,
  batchYear?: string
): Promise<string> => {
  if (role === "BATCH_ADMIN") {
    const { sscBatch } = await getBatchAdminContext(userId);
    return sscBatch;
  }

  if (!batchYear) {
    throw new AppError(400, "Batch year is required.");
  }

  return batchYear;
};

export const getJoinedParticipantsForReminder = async (
  eventId: string,
  targetBatch: string
) => {
  const joined = await prisma.eventParticipant.findMany({
    where: {
      eventId,
      status: "JOINED",
      user: {
        studentProfile: {
          sscBatch: targetBatch,
          status: "APPROVED",
        },
      },
    },
    include: {
      user: {
        include: { studentProfile: true },
      },
    },
  });

  const alreadySent = await prisma.eventReminderDelivery.findMany({
    where: {
      eventId,
      userId: { in: joined.map((p) => p.userId) },
    },
    select: { userId: true },
  });

  const remindedUserIds = new Set(alreadySent.map((r) => r.userId));
  const pending = joined.filter((p) => !remindedUserIds.has(p.userId));

  return {
    joined,
    pending,
    totalJoined: joined.length,
    alreadyReminded: remindedUserIds.size,
    pendingCount: pending.length,
  };
};
