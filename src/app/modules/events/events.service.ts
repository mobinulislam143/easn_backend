import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import {
  assertBatchAdminCanAccessEvent,
  getBatchAdminContext,
} from "../../helpers/batchAdmin";
import { sendEmail, getEventReminderTemplate } from "../../utils/sendEmail";

const getAllEvents = async (filters?: any) => {
  const page = Number(filters?.page) || 1;
  const limit = Number(filters?.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      createdBy: { select: { email: true } },
      participants: { select: { userId: true, status: true } },
      _count: { select: { participants: { where: { status: "JOINED" } } } },
    },
    skip,
    take: limit,
  });

  const total = await prisma.event.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
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

const createEvent = async (userId: string, role: string, payload: any) => {
  let allowedBatch = payload.allowedBatch || [];

  if (role === "BATCH_ADMIN") {
    const { sscBatch } = await getBatchAdminContext(userId);
    allowedBatch = [sscBatch];
  }

  return await prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description,
      date: new Date(payload.date),
      time: payload.time,
      venue: payload.venue,
      organizer: payload.organizer,
      banner:
        payload.banner ||
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      registrationDeadline: new Date(payload.registrationDeadline),
      allowedBatch,
      participantLimit: payload.participantLimit
        ? Number(payload.participantLimit)
        : null,
      createdById: userId,
    },
  });
};

const updateEvent = async (id: string, userId: string, role: string, payload: any) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  await assertBatchAdminCanAccessEvent(userId, role, event);

  let allowedBatch = payload.allowedBatch;
  if (role === "BATCH_ADMIN") {
    const { sscBatch } = await getBatchAdminContext(userId);
    allowedBatch = [sscBatch];
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
      registrationDeadline: payload.registrationDeadline
        ? new Date(payload.registrationDeadline)
        : undefined,
      allowedBatch,
      participantLimit: payload.participantLimit
        ? Number(payload.participantLimit)
        : undefined,
    },
  });
};

const deleteEvent = async (id: string, userId: string, role: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  await assertBatchAdminCanAccessEvent(userId, role, event);

  await prisma.event.delete({
    where: { id },
  });

  return true;
};

const rsvpEvent = async (
  userId: string,
  eventId: string,
  status: "JOINED" | "NOT_JOINED"
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  if (new Date() > new Date(event.registrationDeadline)) {
    throw new AppError(400, "Registration deadline for this event has passed.");
  }

  if (status === "JOINED" && event.allowedBatch.length > 0) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student && !event.allowedBatch.includes(student.sscBatch)) {
      throw new AppError(403, "Your batch is not eligible to join this event.");
    }
  }

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

const sendBatchReminder = async (
  eventId: string,
  batchYear: string,
  userId: string,
  role: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  await assertBatchAdminCanAccessEvent(userId, role, event);

  let targetBatch = batchYear;
  if (role === "BATCH_ADMIN") {
    const { sscBatch } = await getBatchAdminContext(userId);
    targetBatch = sscBatch;
  }

  const students = await prisma.student.findMany({
    where: {
      sscBatch: targetBatch,
      status: "APPROVED",
    },
    include: {
      user: true,
    },
  });

  if (!students.length) {
    throw new AppError(400, `No approved students found in batch ${targetBatch}.`);
  }

  const formattedDate =
    new Date(event.date).toLocaleDateString() + " " + event.time;
  const organizerPhone =
    students.find((s) => s.fullName === event.organizer)?.phone || "";

  const emailPromises = students.map((std) => {
    return sendEmail(
      std.user.email,
      `Event Reminder: ${event.title}`,
      getEventReminderTemplate(
        event.title,
        formattedDate,
        event.venue,
        organizerPhone || std.phone
      )
    ).catch((err) =>
      console.error(`Failed to send event email to ${std.user.email}`, err)
    );
  });

  await Promise.all(emailPromises);

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
    batchYear: targetBatch,
  };
};

const getEventParticipants = async (eventId: string, userId: string, role: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  await assertBatchAdminCanAccessEvent(userId, role, event);

  return await prisma.eventParticipant.findMany({
    where: { eventId, status: "JOINED" },
    include: {
      user: {
        include: {
          studentProfile: true,
        },
      },
    },
  });
};

export const EventService = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  sendBatchReminder,
  getEventParticipants,
};
