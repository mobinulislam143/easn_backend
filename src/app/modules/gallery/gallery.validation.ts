import { z } from "zod";

const uploadPhotoSchema = z.object({
  body: z.object({
    imageUrl: z.string().url("Image URL must be valid"),
    title: z.string().min(3, "Photo title is required"),
    type: z.enum(["REUNION", "EVENT", "BATCH_MEMORIES"]).optional().default("BATCH_MEMORIES"),
    eventId: z.string().optional().nullable(),
    batchId: z.string().optional().nullable(),
  }),
});

export const GalleryValidation = {
  uploadPhotoSchema,
};
