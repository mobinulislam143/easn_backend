import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import bcrypt from "bcryptjs";

const getAllTeachers = async (filters: any) => {
  const whereConditions: any = {};

  if (filters.subject) {
    whereConditions.subject = { contains: filters.subject, mode: "insensitive" };
  }
  if (filters.status) {
    whereConditions.status = filters.status;
  }
  if (filters.search) {
    whereConditions.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { designation: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.teacher.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { name: "asc" },
  });

  const total = await prisma.teacher.count({
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

const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new AppError(404, "Teacher record not found!");
  }

  return teacher;
};

const createTeacher = async (payload: any) => {
  return await prisma.teacher.create({
    data: {
      name: payload.name,
      subject: payload.subject,
      phone: payload.phone,
      email: payload.email,
      designation: payload.designation,
      joiningYear: Number(payload.joiningYear),
      profileImage: payload.profileImage || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      status: payload.status || "ACTIVE",
    },
  });
};

const updateTeacher = async (id: string, payload: any) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new AppError(404, "Teacher record not found!");
  }

  return await prisma.teacher.update({
    where: { id },
    data: {
      name: payload.name,
      subject: payload.subject,
      phone: payload.phone,
      email: payload.email,
      designation: payload.designation,
      joiningYear: payload.joiningYear ? Number(payload.joiningYear) : undefined,
      profileImage: payload.profileImage,
      status: payload.status,
    },
  });
};

const deleteTeacher = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new AppError(404, "Teacher record not found!");
  }

  await prisma.teacher.delete({
    where: { id },
  });

  return true;
};

const createTeacherAccount = async (teacherId: string, payload: { password: string }) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new AppError(404, "Teacher record not found!");
  if (teacher.userId) throw new AppError(400, "This teacher already has a login account!");

  const existingUser = await prisma.user.findUnique({ where: { email: teacher.email } });
  if (existingUser) throw new AppError(400, "Email is already registered as a system user!");

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      email: teacher.email,
      password: hashedPassword,
      role: "TEACHER",
      isVerified: true,
    },
  });

  await prisma.teacher.update({
    where: { id: teacherId },
    data: { userId: user.id },
  });

  return { userId: user.id, email: user.email, role: "TEACHER" };
};

const assignRole = async (studentId: string, role: string) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError(404, "Student not found!");

  return await prisma.user.update({
    where: { id: student.userId },
    data: { role: role as any },
  });
};

export const TeacherService = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  createTeacherAccount,
  assignRole,
};
