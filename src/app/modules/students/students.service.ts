import prisma from "../../helpers/prisma";
import { syncAgreeToJoinReunionFromEventRsvps } from "../../helpers/reunionRsvp";
import AppError from "../../errors/AppError";
import { sendEmail, getApprovalTemplate, getRejectionTemplate } from "../../utils/sendEmail";

const getPendingStudents = async () => {
  return await prisma.student.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { email: true, role: true } } },
  });
};

const getApprovedStudents = async (filters: any) => {
  const whereConditions: any = {};

  if (filters.status && filters.status !== "ALL") {
    whereConditions.status = filters.status;
  } else if (!filters.status) {
    whereConditions.status = "APPROVED";
  }

  if (filters.sscBatch) {
    whereConditions.sscBatch = filters.sscBatch;
  }
  if (filters.group) {
    whereConditions.group = filters.group;
  }
  if (filters.agreeToJoinReunion !== undefined && filters.agreeToJoinReunion !== "") {
    whereConditions.agreeToJoinReunion = filters.agreeToJoinReunion === "true" || filters.agreeToJoinReunion === true;
  }
  if (filters.search) {
    whereConditions.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { currentProfession: { contains: filters.search, mode: "insensitive" } },
      { user: { email: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.student.findMany({
    where: whereConditions,
    include: { user: { select: { email: true, role: true } }, batch: true },
    skip,
    take: limit,
    orderBy: { fullName: "asc" },
  });

  const total = await prisma.student.count({
    where: whereConditions,
  });

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

const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: { select: { email: true, role: true } }, batch: true },
  });

  if (!student) {
    throw new AppError(404, "Student profile not found!");
  }

  return student;
};

const getStudentByUserId = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: { select: { email: true, role: true } }, batch: true },
  });

  if (!student) {
    throw new AppError(404, "Student profile not found!");
  }

  return student;
};

const updateStudentProfile = async (userId: string, payload: any) => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new AppError(404, "Student profile not found!");
  }

  // Update profile
  return await prisma.student.update({
    where: { userId },
    data: {
      fullName: payload.fullName,
      fatherName: payload.fatherName || null,
      motherName: payload.motherName || null,
      phone: payload.phone,
      currentProfession: payload.currentProfession,
      currentAddress: payload.currentAddress,
      profileImage: payload.profileImage,
      shortBio: payload.shortBio || null,
      facebookProfile: payload.facebookProfile || null,
      linkedInProfile: payload.linkedInProfile || null,
    },
  });
};

const approveStudent = async (studentId: string, adminId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) {
    throw new AppError(404, "Student registration not found!");
  }

  if (student.status === "APPROVED") {
    throw new AppError(400, "Student is already approved!");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Student status
    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: { status: "APPROVED" },
    });

    // 2. Verify User
    await tx.user.update({
      where: { id: student.userId },
      data: { isVerified: true },
    });

    // 3. Create Approval History
    await tx.approvalHistory.create({
      data: {
        studentId,
        action: "APPROVED",
        performedById: adminId,
        reason: "Information verified successfully.",
      },
    });

    // 4. Create AlumniProfile (if doesn't exist)
    const existingAlumni = await tx.alumniProfile.findUnique({
      where: { userId: student.userId },
    });

    if (!existingAlumni) {
      await tx.alumniProfile.create({
        data: {
          userId: student.userId,
          currentCompany: "",
          designation: student.currentProfession,
          sscBatch: student.sscBatch,
          batchId: student.batchId,
          isFeatured: false,
          skills: [],
        },
      });
    }

    return updatedStudent;
  });

  await syncAgreeToJoinReunionFromEventRsvps(student.userId);

  // Send approval email
  await sendEmail(
    student.user.email,
    "Your EASN Alumni Account is Approved!",
    getApprovalTemplate(student.fullName)
  ).catch((err) => console.error("Approval email failed", err));

  return result;
};

const rejectStudent = async (studentId: string, adminId: string, reason: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) {
    throw new AppError(404, "Student registration not found!");
  }

  if (student.status === "REJECTED") {
    throw new AppError(400, "Student is already rejected!");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Student status
    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: { status: "REJECTED" },
    });

    // 2. Create Rejection History
    await tx.approvalHistory.create({
      data: {
        studentId,
        action: "REJECTED",
        performedById: adminId,
        reason,
      },
    });

    return updatedStudent;
  });

  // Send rejection email
  await sendEmail(
    student.user.email,
    "Registration Update - EASN Alumni Platform",
    getRejectionTemplate(student.fullName, reason)
  ).catch((err) => console.error("Rejection email failed", err));

  return result;
};

const deleteStudent = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError(404, "Student registration not found!");
  }

  // Delete user, which will cascade delete student and alumni profile
  await prisma.user.delete({
    where: { id: student.userId },
  });

  return true;
};

const updateStudentByAdmin = async (studentId: string, payload: any) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError(404, "Student registration not found!");
  }

  const result = await prisma.$transaction(async (tx) => {
    // If batch year is updated, find or create the corresponding batch
    let batchId = student.batchId;
    if (payload.sscBatch && payload.sscBatch !== student.sscBatch) {
      let batch = await tx.batch.findUnique({
        where: { year: payload.sscBatch },
      });
      if (!batch) {
        batch = await tx.batch.create({
          data: {
            year: payload.sscBatch,
            name: `SSC ${payload.sscBatch}`,
            description: `Class of ${payload.sscBatch} alumni network`,
          },
        });
      }
      batchId = batch.id;
    }

    const updatedStudent = await tx.student.update({
      where: { id: studentId },
      data: {
        fullName: payload.fullName,
        phone: payload.phone,
        sscBatch: payload.sscBatch,
        batchId,
        roll: payload.roll,
        regNo: payload.regNo,
        group: payload.group,
        currentProfession: payload.currentProfession,
        currentAddress: payload.currentAddress,
        status: payload.status,
      },
    });

    if (payload.role) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          role: payload.role,
        },
      });
    }

    return updatedStudent;
  });

  return result;
};

const assignEventToStudent = async (
  studentId: string,
  eventId: string,
  adminId: string,
  adminRole: string
) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { id: true, role: true } } },
  });

  if (!student) {
    throw new AppError(404, "Student not found!");
  }

  if (student.status !== "APPROVED") {
    throw new AppError(400, "Only approved students can be assigned to events.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  if (
    event.allowedBatch.length > 0 &&
    !event.allowedBatch.includes(student.sscBatch)
  ) {
    throw new AppError(
      400,
      `This event is not open to batch ${student.sscBatch}.`
    );
  }

  if (event.participantLimit) {
    const joinedCount = await prisma.eventParticipant.count({
      where: { eventId, status: "JOINED" },
    });
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: { eventId, userId: student.userId },
      },
    });
    if (
      joinedCount >= event.participantLimit &&
      (!existing || existing.status !== "JOINED")
    ) {
      throw new AppError(400, "Event participation limit reached.");
    }
  }

  const participation = await prisma.eventParticipant.upsert({
    where: {
      eventId_userId: { eventId, userId: student.userId },
    },
    update: { status: "JOINED" },
    create: {
      eventId,
      userId: student.userId,
      status: "JOINED",
    },
  });

  await syncAgreeToJoinReunionFromEventRsvps(student.userId);

  await prisma.notification.create({
    data: {
      title: `Registered for ${event.title}`,
      message: `An administrator registered you for ${event.title} on ${new Date(event.date).toLocaleDateString()} at ${event.venue}.`,
      userId: student.userId,
      type: "EVENT_REMINDER",
      link: `/events/${event.id}`,
    },
  });

  return {
    participation,
    event: { id: event.id, title: event.title },
  };
};

export const StudentService = {
  getPendingStudents,
  getApprovedStudents,
  getStudentById,
  getStudentByUserId,
  updateStudentProfile,
  approveStudent,
  rejectStudent,
  deleteStudent,
  updateStudentByAdmin,
  assignEventToStudent,
};
