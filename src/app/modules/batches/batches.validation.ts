import { z } from "zod";

const createBatchSchema = z.object({
  body: z.object({
    year: z.string().regex(/^\d{4}$/, "Year must be a valid 4-digit year"),
    name: z.string().min(3, "Batch name is required").optional(),
    description: z.string().optional(),
    banner: z.string().url("Banner must be a valid URL").optional(),
  }),
});

const updateBatchSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Batch name is required").optional(),
    description: z.string().optional(),
    banner: z.string().url("Banner must be a valid URL").optional(),
  }),
});

export const BatchValidation = {
  createBatchSchema,
  updateBatchSchema,
};
