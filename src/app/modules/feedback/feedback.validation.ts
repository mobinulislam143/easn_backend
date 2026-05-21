import { z } from "zod";

const createContactMessageSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(5, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    type: z.enum(["PUBLIC", "BATCH_ADMIN", "COMPLAINT"]).optional().default("PUBLIC"),
    batchId: z.string().optional().nullable(),
  }),
});

const submitFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
    message: z.string().min(10, "Message must be at least 10 characters"),
    suggestions: z.string().optional(),
  }),
});

export const FeedbackValidation = {
  createContactMessageSchema,
  submitFeedbackSchema,
};
