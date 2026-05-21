import { z } from "zod";

const updateAlumniProfileSchema = z.object({
  body: z.object({
    currentCompany: z.string().min(2, "Company name is required").optional(),
    designation: z.string().min(2, "Designation is required").optional(),
    skills: z.array(z.string()).optional(),
  }),
});

export const AlumniValidation = {
  updateAlumniProfileSchema,
};
