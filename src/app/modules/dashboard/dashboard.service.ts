import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import {
  assertBatchAdminCanAccessEvent,
  getBatchAdminContext,
} from "../../helpers/batchAdmin";

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

  const reunionParticipants = await prisma.student.count({
    where: { status: "APPROVED", agreeToJoinReunion: true },
  });

  return {
    totalStudents,
    totalTeachers,
    totalEvents,
    pendingApprovals,
    recentRegistrations,
    batchStats,
    activityLogs,
    reunionParticipants,
  };
};

const getStudentDashboardSummary = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      batch: true,
      user: {
        include: {
          alumniProfile: true,
        },
      },
    },
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
const getStudentsExportData = async (filters: any, userId?: string, role?: string) => {
  const whereConditions: any = {};

  if (role === "BATCH_ADMIN" && userId) {
    const { sscBatch } = await getBatchAdminContext(userId);
    whereConditions.sscBatch = sscBatch;
  } else if (filters.batch) {
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

const getEventParticipantsExportData = async (
  eventId: string,
  userId?: string,
  role?: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, "Event not found!");
  }

  if (userId && role) {
    await assertBatchAdminCanAccessEvent(userId, role, event);
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

const getReunionParticipantsExportData = async () => {
  const students = await prisma.student.findMany({
    where: {
      status: "APPROVED",
      agreeToJoinReunion: true,
    },
    include: { user: { select: { email: true } } },
  });

  let csvContent = "FullName,Email,Phone,SSC Batch,Roll,RegNo,Group,Profession,Address\n";
  students.forEach((s) => {
    csvContent += `"${s.fullName}","${s.user.email}","${s.phone}","${s.sscBatch}","${s.roll || ""}","${s.regNo || ""}","${s.group}","${s.currentProfession}","${s.currentAddress.replace(/"/g, '""')}"\n`;
  });

  return csvContent;
};

const getTeacherDashboardSummary = async (userId: string) => {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) throw new AppError(404, "Teacher profile not found!");

  const totalStudents = await prisma.student.count({ where: { status: "APPROVED" } });
  const totalBatches = await prisma.batch.count();
  const totalEvents = await prisma.event.count();

  const upcomingEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { date: "asc" },
    where: { date: { gte: new Date() } },
  });

  const recentNotices = await prisma.notice.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const recentBlogs = await prisma.blog.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true } },
        },
      },
    },
  });

  return {
    profile: teacher,
    stats: { totalStudents, totalBatches, totalEvents },
    upcomingEvents,
    recentNotices,
    recentBlogs,
  };
};

const getBatchAdminDashboardSummary = async (userId: string) => {
  // Batch admin is a student who was promoted; find their student profile for batch context
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { batch: true, user: { select: { email: true } } },
  });

  const batchFilter = student ? { batchId: student.batchId } : {};

  const approvedInBatch = await prisma.student.count({
    where: { status: "APPROVED", ...batchFilter },
  });
  const pendingInBatch = await prisma.student.count({
    where: { status: "PENDING", ...batchFilter },
  });
  const reunionInBatch = await prisma.student.count({
    where: { status: "APPROVED", agreeToJoinReunion: true, ...batchFilter },
  });

  const pendingStudents = await prisma.student.findMany({
    where: { status: "PENDING", ...batchFilter },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const eventScope = student
    ? {
        OR: [
          { allowedBatch: { has: student.sscBatch } },
          { createdById: userId },
        ],
      }
    : {};

  const totalEvents = await prisma.event.count({ where: eventScope });
  const upcomingEvents = await prisma.event.findMany({
    take: 10,
    orderBy: { date: "asc" },
    where: { date: { gte: new Date() }, ...eventScope },
    include: {
      _count: { select: { participants: { where: { status: "JOINED" } } } },
    },
  });

  const recentNotices = await prisma.notice.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const batchMembers = student
    ? await prisma.student.findMany({
        where: { batchId: student.batchId, status: "APPROVED" },
        take: 8,
        orderBy: { fullName: "asc" },
        include: { user: { select: { email: true } } },
      })
    : [];

  const pendingBlogs = student
    ? await prisma.blog.findMany({
        where: { status: "PENDING", batchId: student.batchId },
        include: {
          author: {
            select: {
              email: true,
              studentProfile: { select: { fullName: true, profileImage: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const pendingGallery = student
    ? await prisma.gallery.findMany({
        where: { status: "PENDING", batchId: student.batchId },
        include: {
          uploadedBy: {
            select: {
              email: true,
              studentProfile: { select: { fullName: true, profileImage: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return {
    profile: student || null,
    stats: {
      approvedInBatch,
      pendingInBatch,
      reunionInBatch,
      totalEvents,
      pendingBlogsCount: pendingBlogs.length,
      pendingGalleryCount: pendingGallery.length,
    },
    pendingStudents,
    upcomingEvents,
    recentNotices,
    batchMembers,
    pendingBlogs,
    pendingGallery,
  };
};

export const DashboardService = {
  getAdminDashboardSummary,
  getStudentDashboardSummary,
  getTeacherDashboardSummary,
  getBatchAdminDashboardSummary,
  getNotifications,
  markNotificationRead,
  getStudentsExportData,
  getTeachersExportData,
  getEventParticipantsExportData,
  getReunionParticipantsExportData,
};
