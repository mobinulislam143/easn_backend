import { z } from "zod";

const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment cannot exceed 1000 characters"),
    targetType: z.enum(["BLOG", "EVENT", "NOTICE", "GALLERY"]),
    targetId: z.string().min(1, "Target ID is required"),
  }),
});

export const CommentValidation = {
  addCommentSchema,
};
