import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const addComment = async (userId: string, payload: any) => {
  const { content, targetType, targetId } = payload;

  if (!content) {
    throw new AppError(400, "Comment content cannot be empty.");
  }

  const data: any = { content, userId, blogId: null, eventId: null, noticeId: null, galleryId: null };

  switch (targetType) {
    case "BLOG":    data.blogId    = targetId; break;
    case "EVENT":   data.eventId   = targetId; break;
    case "NOTICE":  data.noticeId  = targetId; break;
    case "GALLERY": data.galleryId = targetId; break;
    default:
      throw new AppError(400, "Invalid target type. Must be BLOG, EVENT, NOTICE, or GALLERY.");
  }

  return await prisma.comment.create({
    data,
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
