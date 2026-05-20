import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const getAlumniDirectory = async (filters: any) => {
  const { search, sscBatch, group, profession, company, isFeatured } = filters;

  const whereConditions: any = {
    status: "APPROVED",
  };

  if (sscBatch) {
    whereConditions.sscBatch = sscBatch;
  }
  if (group) {
    whereConditions.group = group;
  }
  if (profession) {
    whereConditions.currentProfession = { contains: profession, mode: "insensitive" };
  }

  // Handle name search
  if (search) {
    whereConditions.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { currentProfession: { contains: search, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          email: true,
          alumniProfile: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  // Filter by company name on user's alumni profile if needed
  let results = students.map((std) => ({
    id: std.id,
    fullName: std.fullName,
    phone: std.phone,
    email: std.user.email,
    sscBatch: std.sscBatch,
    group: std.group,
    currentProfession: std.currentProfession,
    currentAddress: std.currentAddress,
    profileImage: std.profileImage,
    shortBio: std.shortBio,
    facebookProfile: std.facebookProfile,
    linkedInProfile: std.linkedInProfile,
    currentCompany: std.user.alumniProfile?.currentCompany || "",
    designation: std.user.alumniProfile?.designation || std.currentProfession,
    isFeatured: std.user.alumniProfile?.isFeatured || false,
    skills: std.user.alumniProfile?.skills || [],
  }));

  if (company) {
    results = results.filter((res) =>
      res.currentCompany.toLowerCase().includes(company.toLowerCase())
    );
  }

  if (isFeatured === "true" || isFeatured === true) {
    results = results.filter((res) => res.isFeatured === true);
  }

  return results;
};

const getAlumniProfile = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        include: { alumniProfile: true },
      },
      batch: true,
    },
  });

  if (!student || student.status !== "APPROVED") {
    throw new AppError(404, "Approved alumni record not found!");
  }

  return {
    id: student.id,
    fullName: student.fullName,
    phone: student.phone,
    email: student.user.email,
    sscBatch: student.sscBatch,
    group: student.group,
    roll: student.roll,
    regNo: student.regNo,
    currentProfession: student.currentProfession,
    currentAddress: student.currentAddress,
    profileImage: student.profileImage,
    shortBio: student.shortBio,
    facebookProfile: student.facebookProfile,
    linkedInProfile: student.linkedInProfile,
    currentCompany: student.user.alumniProfile?.currentCompany || "",
    designation: student.user.alumniProfile?.designation || student.currentProfession,
    isFeatured: student.user.alumniProfile?.isFeatured || false,
    skills: student.user.alumniProfile?.skills || [],
    createdAt: student.createdAt,
  };
};

const toggleFeaturedAlumni = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: { include: { alumniProfile: true } } },
  });

  if (!student) {
    throw new AppError(404, "Student record not found!");
  }

  const userId = student.userId;

  let alumni = await prisma.alumniProfile.findUnique({
    where: { userId },
  });

  if (!alumni) {
    alumni = await prisma.alumniProfile.create({
      data: {
        userId,
        currentCompany: "",
        designation: student.currentProfession,
        sscBatch: student.sscBatch,
        batchId: student.batchId,
        isFeatured: true,
      },
    });
  } else {
    alumni = await prisma.alumniProfile.update({
      where: { userId },
      data: {
        isFeatured: !alumni.isFeatured,
      },
    });
  }

  return alumni;
};

const updateAlumniProfession = async (userId: string, payload: any) => {
  let alumni = await prisma.alumniProfile.findUnique({
    where: { userId },
  });

  if (!alumni) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new AppError(404, "Student profile not found!");
    }
    alumni = await prisma.alumniProfile.create({
      data: {
        userId,
        currentCompany: payload.currentCompany || "",
        designation: payload.designation || student.currentProfession,
        sscBatch: student.sscBatch,
        batchId: student.batchId,
        skills: payload.skills || [],
        isFeatured: false,
      },
    });
  } else {
    alumni = await prisma.alumniProfile.update({
      where: { userId },
      data: {
        currentCompany: payload.currentCompany,
        designation: payload.designation,
        skills: payload.skills,
      },
    });
  }

  return alumni;
};

export const AlumniService = {
  getAlumniDirectory,
  getAlumniProfile,
  toggleFeaturedAlumni,
  updateAlumniProfession,
};
