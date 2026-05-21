import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import {
  sendEmail,
  getWelcomeTemplate,
  getAdminNotificationTemplate,
  getResetPasswordTemplate,
} from "../../utils/sendEmail";
import crypto from "crypto";
import { getReservedAdminEmail } from "../../helpers/ensureSystemAdmin";

const registerStudent = async (payload: any) => {
  const email = String(payload.email).trim().toLowerCase();
  const reservedAdminEmail = getReservedAdminEmail();

  if (reservedAdminEmail && email === reservedAdminEmail) {
    throw new AppError(
      403,
      "This email is reserved for the system administrator. Sign in from the login page instead of registering."
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.role === "SUPER_ADMIN" || existingUser.role === "TEACHER") {
      throw new AppError(
        403,
        "This account cannot be registered as a student. Use the login page instead."
      );
    }
    throw new AppError(400, "Email is already registered!");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Handle Batch find/create
  let batch = await prisma.batch.findUnique({
    where: { year: payload.sscBatch },
  });

  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        year: payload.sscBatch,
        name: `SSC ${payload.sscBatch}`,
        description: `Class of ${payload.sscBatch} alumni network`,
      },
    });
  }

  // Database transaction for User and Student profile
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "STUDENT",
        isVerified: false,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        fullName: payload.fullName,
        fatherName: payload.fatherName || null,
        motherName: payload.motherName || null,
        phone: payload.phone,
        sscBatch: payload.sscBatch,
        batchId: batch.id,
        roll: payload.roll || null,
        regNo: payload.regNo || null,
        group: payload.group,
        currentProfession: payload.currentProfession,
        currentAddress: payload.currentAddress,
        profileImage: payload.profileImage,
        shortBio: payload.shortBio || null,
        facebookProfile: payload.facebookProfile || null,
        linkedInProfile: payload.linkedInProfile || null,
        status: "PENDING",
        agreeToJoinReunion: payload.agreeToJoinReunion === true,
      },
    });

    return { user, student };
  });

  // Send Welcome Email to Student
  await sendEmail(
    email,
    "Welcome to EASN Alumni Platform - Registration Pending",
    getWelcomeTemplate(payload.fullName)
  ).catch((err) => console.error("Welcome email failed", err));

  // Send Notification Email to Admin
  const adminEmail = process.env.ADMIN_EMAIL || "mahi@gmail.com";
  await sendEmail(
    adminEmail,
    "New Student Registration Pending Approval",
    getAdminNotificationTemplate(
      payload.fullName,
      payload.sscBatch,
      email,
      payload.phone
    )
  ).catch((err) => console.error("Admin notification email failed", err));

  return result.student;
};

const resolveLoginProfile = (user: {
  role: string;
  email: string;
  studentProfile?: { fullName: string; profileImage: string } | null;
  teacherProfile?: { name: string; profileImage: string } | null;
}) => {
  if (user.studentProfile) {
    return {
      fullName: user.studentProfile.fullName,
      profileImage: user.studentProfile.profileImage,
    };
  }

  if (user.role === "TEACHER" && user.teacherProfile) {
    return {
      fullName: user.teacherProfile.name,
      profileImage: user.teacherProfile.profileImage,
    };
  }

  if (user.role === "SUPER_ADMIN") {
    return {
      fullName: process.env.ADMIN_NAME || "Super Admin",
      profileImage: "",
    };
  }

  if (user.role === "BATCH_ADMIN") {
    return {
      fullName: process.env.ADMIN_NAME || "Batch Admin",
      profileImage: "",
    };
  }

  return {
    fullName: user.email.split("@")[0],
    profileImage: "",
  };
};

const loginUser = async (payload: any) => {
  const email = String(payload.email).trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email, isDeleted: false },
    include: { studentProfile: true, teacherProfile: true },
  });

  if (!user) {
    throw new AppError(404, "User not found with this email!");
  }

  if (user.role === "SUPER_ADMIN" || user.role === "TEACHER") {
    // Admin and teacher accounts are provisioned in the backend only
  } else if (user.role !== "STUDENT" && user.role !== "BATCH_ADMIN") {
    throw new AppError(403, "This account type cannot sign in here.");
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Incorrect password!");
  }

  // Students and batch admins need an approved student profile
  if (
    (user.role === "STUDENT" || user.role === "BATCH_ADMIN") &&
    user.studentProfile
  ) {
    if (user.studentProfile.status === "PENDING") {
      throw new AppError(
        403,
        "Your registration is pending approval by the administrator."
      );
    }
    if (user.studentProfile.status === "REJECTED") {
      throw new AppError(
        403,
        "Your registration request has been rejected. Please contact administration."
      );
    }
  } else if (
    (user.role === "STUDENT" || user.role === "BATCH_ADMIN") &&
    !user.studentProfile
  ) {
    throw new AppError(
      403,
      "No student profile linked to this account. Contact the administrator."
    );
  }

  const profile = resolveLoginProfile(user);

  // Generate tokens
  const jwtSecret = process.env.JWT_SECRET || "MyEasnSecret";
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "MyEasnRefreshSecret";

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtRefreshSecret,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: profile.fullName,
      profileImage: profile.profileImage,
    },
  };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(404, "No account matches this email!");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires,
    },
  });

  const resetUrl = `${
    process.env.FRONTEND_URL || "https://easn-alumni.vercel.app"
  }/reset-password?token=${resetToken}`;

  await sendEmail(
    email,
    "Reset Password Request - EASN Alumni",
    getResetPasswordTemplate(resetUrl)
  );

  return true;
};

const resetPassword = async (payload: any) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: payload.token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(400, "Reset token is invalid or has expired!");
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return true;
};

export const AuthService = {
  registerStudent,
  loginUser,
  forgotPassword,
  resetPassword,
};
