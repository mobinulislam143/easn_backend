import { z } from "zod";

const updateStudentProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Full name is required").optional(),
    fatherName: z.string().optional().nullable(),
    motherName: z.string().optional().nullable(),
    phone: z.string().min(10, "Phone number is required").optional(),
    currentProfession: z.string().min(2, "Profession is required").optional(),
    currentAddress: z.string().min(5, "Address is required").optional(),
    profileImage: z.string().url("Profile image must be a valid URL").optional(),
    shortBio: z.string().max(300, "Bio should be under 300 characters").optional().nullable(),
    facebookProfile: z.string().url("Invalid Facebook link").optional().or(z.literal("")).nullable(),
    linkedInProfile: z.string().url("Invalid LinkedIn link").optional().or(z.literal("")).nullable(),
  }).strict("Reunion RSVP is managed from the Events page only."),
});

const assignEventSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event is required"),
  }),
});

export const StudentValidation = {
  updateStudentProfileSchema,
  assignEventSchema,
};
