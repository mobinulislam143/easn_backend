import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { sendEmail, getApprovalTemplate, getRejectionTemplate } from "../../utils/sendEmail";

const getPendingStudents = async () => {
  return await prisma.student.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { email: true, role: true } } },
  });
};

const getApprovedStudents = async (filters: any) => {
  const whereConditions: any = { status: "APPROVED" };

  if (filters.sscBatch) {
    whereConditions.sscBatch = filters.sscBatch;
  }
  if (filters.group) {
    whereConditions.group = filters.group;
  }
  if (filters.search) {
    whereConditions.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { currentProfession: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.student.findMany({
    where: whereConditions,
    include: { user: { select: { email: true } }, batch: true },
  });
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
      phone: payload.phone,
      currentProfession: payload.currentProfession,
      currentAddress: payload.currentAddress,
      profileImage: payload.profileImage,
      shortBio: payload.shortBio,
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

export const StudentService = {
  getPendingStudents,
  getApprovedStudents,
  getStudentById,
  getStudentByUserId,
  updateStudentProfile,
  approveStudent,
  rejectStudent,
};
