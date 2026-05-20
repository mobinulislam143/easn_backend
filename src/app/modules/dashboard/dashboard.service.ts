import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const getAdminDashboardSummary = async () => {
  const totalStudents = await prisma.student.count({
    where: { status: "APPROVED" },
  });

  const totalTeachers = await prisma.teacher.count();

  const totalEvents = await prisma.event.count();

  const pendingApprovals = await prisma.student.count({
    where: { status: "PENDING" },
  });

  const recentRegistrations = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  // Batch analytics
  const batches = await prisma.batch.findMany({
    include: {
      _count: {
        select: { students: { where: { status: "APPROVED" } } },
      },
    },
  });

  const batchStats = batches.map((b) => ({
    name: b.name,
    year: b.year,
    count: b._count.students,
  }));

  // Activity logs
  const activityLogs = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
  });

  return {
    totalStudents,
    totalTeachers,
    totalEvents,
    pendingApprovals,
    recentRegistrations,
    batchStats,
    activityLogs,
  };
};

const getStudentDashboardSummary = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { batch: true },
  });

  if (!student) {
    throw new AppError(404, "Student profile not found!");
  }

  // Count joined events
  const joinedEventsCount = await prisma.eventParticipant.count({
    where: { userId, status: "JOINED" },
  });

  // Get in-app notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get batch members count
  const batchMembersCount = await prisma.student.count({
    where: { batchId: student.batchId, status: "APPROVED" },
  });

  // Batch timeline (recent batch gallery or events)
  const batchTimeline = await prisma.gallery.findMany({
    where: { batchId: student.batchId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return {
    profile: student,
    joinedEventsCount,
    batchMembersCount,
    notifications,
    batchTimeline,
  };
};

const getNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const markNotificationRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError(404, "Notification not found!");
  }

  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

// CSV Export data formatters
const getStudentsExportData = async (filters: any) => {
  const whereConditions: any = {};

  if (filters.batch) {
    whereConditions.sscBatch = filters.batch;
  }
  if (filters.group) {
    whereConditions.group = filters.group;
  }
  if (filters.status) {
    whereConditions.status = filters.status;
  }

  const students = await prisma.student.findMany({
    where: whereConditions,
    include: { user: { select: { email: true } } },
  });

  let csvContent = "FullName,Email,Phone,SSC Batch,Roll,RegNo,Group,Profession,Address\n";
  students.forEach((s) => {
    csvContent += `"${s.fullName}","${s.user.email}","${s.phone}","${s.sscBatch}","${s.roll || ""}","${s.regNo || ""}","${s.group}","${s.currentProfession}","${s.currentAddress.replace(/"/g, '""')}"\n`;
  });

  return csvContent;
};

const getTeachersExportData = async () => {
  const teachers = await prisma.teacher.findMany();

  let csvContent = "Name,Email,Phone,Subject,Designation,JoiningYear,Status\n";
  teachers.forEach((t) => {
    csvContent += `"${t.name}","${t.email}","${t.phone}","${t.subject}","${t.designation}","${t.joiningYear}","${t.status}"\n`;
  });

  return csvContent;
};

const getEventParticipantsExportData = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  const participants = await prisma.eventParticipant.findMany({
    where: { eventId, status: "JOINED" },
    include: {
      user: {
        include: {
          studentProfile: true,
        },
      },
    },
  });

  let csvContent = "FullName,Email,Phone,SSC Batch,Roll,RegNo,Group,Profession,Address\n";
  participants.forEach((p) => {
    const s = p.user.studentProfile;
    if (s) {
      csvContent += `"${s.fullName}","${p.user.email}","${s.phone}","${s.sscBatch}","${s.roll || ""}","${s.regNo || ""}","${s.group}","${s.currentProfession}","${s.currentAddress.replace(/"/g, '""')}"\n`;
    }
  });

  return csvContent;
};

export const DashboardService = {
  getAdminDashboardSummary,
  getStudentDashboardSummary,
  getNotifications,
  markNotificationRead,
  getStudentsExportData,
  getTeachersExportData,
  getEventParticipantsExportData,
};
