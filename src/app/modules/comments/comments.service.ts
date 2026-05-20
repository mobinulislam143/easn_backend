import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const addComment = async (userId: string, payload: any) => {
  const { content, blogId, eventId, noticeId, galleryId } = payload;

  if (!content) {
    throw new AppError(400, "Comment content cannot be empty.");
  }

  // Ensure exactly one target is provided
  const targetsCount = [blogId, eventId, noticeId, galleryId].filter(Boolean).length;
  if (targetsCount !== 1) {
    throw new AppError(400, "Comment must belong to exactly one target (blog, event, notice, or gallery).");
  }

  return await prisma.comment.create({
    data: {
      content,
      userId,
      blogId: blogId || null,
      eventId: eventId || null,
      noticeId: noticeId || null,
      galleryId: galleryId || null,
    },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
        },
      },
    },
  });
};

const deleteComment = async (commentId: string, userId: string, userRole: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new AppError(404, "Comment not found!");
  }

  // Allow comment author, SUPER_ADMIN, or BATCH_ADMIN to delete
  if (comment.userId !== userId && userRole !== "SUPER_ADMIN" && userRole !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to delete this comment.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return true;
};

export const CommentService = {
  addComment,
  deleteComment,
};
