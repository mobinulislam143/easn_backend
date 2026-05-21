import bcrypt from "bcryptjs";
import prisma from "./prisma";

/**
 * Creates or updates the super admin from environment variables.
 * Admins are not created via public registration — configure in .env / Vercel.
 *
 * Required: ADMIN_EMAIL, ADMIN_PASSWORD
 * Optional: ADMIN_NAME (display name on login)
 */
export const ensureSystemAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.warn(
      "[Admin] ADMIN_EMAIL and ADMIN_PASSWORD are not set. Super admin account was not provisioned."
    );
    return;
  }

  if (adminPassword.length < 6) {
    console.warn("[Admin] ADMIN_PASSWORD must be at least 6 characters.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingByEmail = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isVerified: true,
        isDeleted: false,
      },
    });
    console.log(`[Admin] Super admin ready: ${adminEmail}`);
    return;
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingSuperAdmin) {
    await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: {
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        isDeleted: false,
      },
    });
    console.log(`[Admin] Super admin credentials updated: ${adminEmail}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });

  console.log(`[Admin] Super admin created: ${adminEmail}`);
};

export const getReservedAdminEmail = (): string | null => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
};
