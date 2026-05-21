import { z } from "zod";

const createTeacherSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Teacher name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    subject: z.string().min(2, "Subject is required"),
    designation: z.enum(["Head Teacher", "Assistant Head Teacher", "Senior Teacher", "Assistant Teacher"]),
    joiningYear: z.string().regex(/^\d{4}$/, "Joining year must be a valid 4-digit year"),
    status: z.enum(["ACTIVE", "RETIRED"]).optional().default("ACTIVE"),
    profileImage: z.string().url("Profile image must be a valid URL").optional(),
  }),
});

const updateTeacherSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Teacher name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(10, "Phone number is required").optional(),
    subject: z.string().min(2, "Subject is required").optional(),
    designation: z.enum(["Head Teacher", "Assistant Head Teacher", "Senior Teacher", "Assistant Teacher"]).optional(),
    joiningYear: z.string().regex(/^\d{4}$/, "Joining year must be a valid 4-digit year").optional(),
    status: z.enum(["ACTIVE", "RETIRED"]).optional(),
    profileImage: z.string().url("Profile image must be a valid URL").optional(),
  }),
});

export const TeacherValidation = {
  createTeacherSchema,
  updateTeacherSchema,
};
