import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { sendEmail, getEventReminderTemplate } from "../../utils/sendEmail";

const getAllEvents = async () => {
  return await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      createdBy: { select: { email: true } },
      _count: { select: { participants: { where: { status: "JOINED" } } } },
    },
  });
};

const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: { select: { email: true } },
      participants: {
        include: {
          user: {
            include: { studentProfile: true },
          },
        },
      },
    },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  return event;
};

const createEvent = async (userId: string, payload: any) => {
  return await prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description,
      date: new Date(payload.date),
      time: payload.time,
      venue: payload.venue,
      organizer: payload.organizer,
      banner: payload.banner || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      registrationDeadline: new Date(payload.registrationDeadline),
      allowedBatch: payload.allowedBatch || [],
      participantLimit: payload.participantLimit ? Number(payload.participantLimit) : null,
      createdById: userId,
    },
  });
};

const updateEvent = async (id: string, payload: any) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  return await prisma.event.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      date: payload.date ? new Date(payload.date) : undefined,
      time: payload.time,
      venue: payload.venue,
      organizer: payload.organizer,
      banner: payload.banner,
      registrationDeadline: payload.registrationDeadline ? new Date(payload.registrationDeadline) : undefined,
      allowedBatch: payload.allowedBatch,
      participantLimit: payload.participantLimit ? Number(payload.participantLimit) : undefined,
    },
  });
};

const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  await prisma.event.delete({
    where: { id },
  });

  return true;
};

const rsvpEvent = async (userId: string, eventId: string, status: "JOINED" | "NOT_JOINED") => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  // Validate deadline
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new AppError(400, "Registration deadline for this event has passed.");
  }

  // If status is JOINED, check participant limit
  if (status === "JOINED" && event.participantLimit) {
    const joinedCount = await prisma.eventParticipant.count({
      where: { eventId, status: "JOINED" },
    });
    if (joinedCount >= event.participantLimit) {
      throw new AppError(400, "Event participation limit reached.");
    }
  }

  return await prisma.eventParticipant.upsert({
    where: {
      eventId_userId: { eventId, userId },
    },
    update: { status },
    create: { eventId, userId, status },
  });
};

const sendBatchReminder = async (eventId: string, batchYear: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  // Get all approved students in that batch
  const students = await prisma.student.findMany({
    where: {
      sscBatch: batchYear,
      status: "APPROVED",
    },
    include: {
      user: true,
    },
  });

  if (!students.length) {
    throw new AppError(400, `No approved students found in batch ${batchYear}.`);
  }

  const formattedDate = new Date(event.date).toLocaleDateString() + " " + event.time;
  const organizerPhone = students.find((s) => s.fullName === event.organizer)?.phone || ""; // try to match organizer phone

  // Send email to each student
  const emailPromises = students.map((std) => {
    return sendEmail(
      std.user.email,
      `Event Reminder: ${event.title}`,
      getEventReminderTemplate(event.title, formattedDate, event.venue, organizerPhone || std.phone)
    ).catch((err) => console.error(`Failed to send event email to ${std.user.email}`, err));
  });

  await Promise.all(emailPromises);

  // Register in-app notifications
  const notificationPromises = students.map((std) => {
    return prisma.notification.create({
      data: {
        title: `Reminder: ${event.title}`,
        message: `Join us for ${event.title} at ${event.venue} on ${formattedDate}.`,
        userId: std.userId,
        type: "EVENT_REMINDER",
        link: `/events/${event.id}`,
      },
    });
  });

  await Promise.all(notificationPromises);

  return {
    success: true,
    recipientsCount: students.length,
  };
};

export const EventService = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  sendBatchReminder,
};
