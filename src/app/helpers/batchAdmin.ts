import prisma from "./prisma";
import AppError from "../errors/AppError";

export type BatchAdminContext = {
  userId: string;
  batchId: string;
  sscBatch: string;
};

export const getBatchAdminContext = async (userId: string): Promise<BatchAdminContext> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { batchId: true, sscBatch: true },
  });

  if (!student) {
    throw new AppError(
      400,
      "Batch admin profile is incomplete. Link this account to an approved student record for your batch."
    );
  }

  return {
    userId,
    batchId: student.batchId,
    sscBatch: student.sscBatch,
  };
};

/** Batch admin may manage events scoped to their SSC batch. */
export const assertBatchAdminCanAccessEvent = async (
  userId: string,
  role: string,
  event: { allowedBatch: string[]; createdById: string }
) => {
  if (role === "SUPER_ADMIN") return;

  if (role !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to manage this event.");
  }

  const { sscBatch } = await getBatchAdminContext(userId);
  const batchAllowed =
    event.allowedBatch.length === 0 || event.allowedBatch.includes(sscBatch);
  const createdByAdmin = event.createdById === userId;

  if (!batchAllowed && !createdByAdmin) {
    throw new AppError(403, "You can only manage events for your own batch.");
  }
};
