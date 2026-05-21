import prisma from "./prisma";

/**
 * `agreeToJoinReunion` is a denormalized flag synced from event RSVPs only.
 * True when the student has at least one EventParticipant with status JOINED.
 */
export const syncAgreeToJoinReunionFromEventRsvps = async (
  userId: string
): Promise<boolean> => {
  const joinedCount = await prisma.eventParticipant.count({
    where: { userId, status: "JOINED" },
  });

  const agreeToJoinReunion = joinedCount > 0;

  await prisma.student.updateMany({
    where: { userId },
    data: { agreeToJoinReunion },
  });

  return agreeToJoinReunion;
};
