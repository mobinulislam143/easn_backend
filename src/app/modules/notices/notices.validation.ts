import { z } from "zod";

const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Notice title is required"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    isPinned: z.boolean().optional().default(false),
    scheduledAt: z.string().datetime("Invalid scheduled date format").optional().nullable(),
    sendEmailBroadcast: z.boolean().optional().default(false),
  }),
});

const updateNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Notice title is required").optional(),
    content: z.string().min(10, "Content must be at least 10 characters").optional(),
    isPinned: z.boolean().optional(),
    scheduledAt: z.string().datetime("Invalid scheduled date format").optional().nullable(),
    sendEmailBroadcast: z.boolean().optional(),
  }),
});

export const NoticeValidation = {
  createNoticeSchema,
  updateNoticeSchema,
};
