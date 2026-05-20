import { z } from "zod";

const registerStudentSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(3, "Full Name is required"),
    fatherName: z.string().min(3, "Father's Name is required"),
    motherName: z.string().min(3, "Mother's Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    sscBatch: z.string().regex(/^\d{4}$/, "Batch must be a valid 4-digit year"),
    roll: z.string().optional(),
    regNo: z.string().optional(),
    group: z.enum(["SCIENCE", "HUMANITIES", "COMMERCE"]),
    currentProfession: z.string().min(2, "Profession is required"),
    currentAddress: z.string().min(5, "Address is required"),
    profileImage: z.string().url("Profile Image must be a valid URL").optional().default("https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"),
    shortBio: z.string().max(300, "Bio should be under 300 characters"),
    facebookProfile: z.string().url("Invalid Facebook link").optional().or(z.literal("")),
    linkedInProfile: z.string().url("Invalid LinkedIn link").optional().or(z.literal("")),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const AuthValidation = {
  registerStudentSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
