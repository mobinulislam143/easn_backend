import { z } from "zod";

const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Event title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    date: z.string().datetime("Invalid date format"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    venue: z.string().min(5, "Venue is required"),
    organizer: z.string().min(3, "Organizer name is required"),
    banner: z.string().url("Banner must be a valid URL").optional(),
    registrationDeadline: z.string().datetime("Invalid deadline format"),
    allowedBatch: z.array(z.string()).optional().default([]),
    participantLimit: z.number().int().positive("Participant limit must be a positive number").optional().nullable(),
  }),
});

const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Event title is required").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    date: z.string().datetime("Invalid date format").optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
    venue: z.string().min(5, "Venue is required").optional(),
    organizer: z.string().min(3, "Organizer name is required").optional(),
    banner: z.string().url("Banner must be a valid URL").optional(),
    registrationDeadline: z.string().datetime("Invalid deadline format").optional(),
    allowedBatch: z.array(z.string()).optional(),
    participantLimit: z.number().int().positive("Participant limit must be a positive number").optional().nullable(),
  }),
});

const rsvpEventSchema = z.object({
  body: z.object({
    status: z.enum(["JOINED", "NOT_JOINED"]),
  }),
});

const sendReminderSchema = z.object({
  body: z.object({
    batchYear: z.string().regex(/^\d{4}$/, "Batch year must be a valid 4-digit year"),
  }),
});

export const EventValidation = {
  createEventSchema,
  updateEventSchema,
  rsvpEventSchema,
  sendReminderSchema,
};
