import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { getBatchAdminContext } from "../../helpers/batchAdmin";

// Only show published content (null = legacy records created before status field existed)
const publishedFilter = {
  OR: [{ status: "PUBLISHED" as const }, { status: null }],
};

const getAllBlogs = async (filters: any) => {
  const { category, search, tag, isFeatured } = filters;

  const andConditions: any[] = [publishedFilter];

  if (category) andConditions.push({ category });
  if (isFeatured === "true" || isFeatured === true) andConditions.push({ isFeatured: true });
  if (tag) andConditions.push({ tags: { has: tag } });
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions = { AND: andConditions };

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const data = await prisma.blog.findMany({
    where: whereConditions,
    include: {
      author: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
        },
      },
      comments: true,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.blog.count({ where: whereConditions });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data,
  };
};

const getBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              email: true,
              studentProfile: { select: { fullName: true, profileImage: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!blog) throw new AppError(404, "Blog post not found!");
  return blog;
};

const createBlog = async (userId: string, payload: any, userRole: string) => {
  let status: "PENDING" | "PUBLISHED" = "PUBLISHED";
  let batchId: string | null = null;

  if (userRole === "STUDENT") {
    status = "PENDING";
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student) batchId = student.batchId;
  }

  return await prisma.blog.create({
    data: {
      title: payload.title,
      content: payload.content,
      banner: payload.coverImage || payload.banner || "",
      category: payload.category,
      tags: payload.tags || [],
      isFeatured: false,
      authorId: userId,
      status,
      batchId,
    },
  });
};

const updateBlog = async (id: string, payload: any) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog post not found!");

  return await prisma.blog.update({
    where: { id },
    data: {
      title: payload.title,
      content: payload.content,
      banner: payload.coverImage || payload.banner,
      category: payload.category,
      tags: payload.tags,
      isFeatured: payload.isFeatured,
    },
  });
};

const deleteBlog = async (id: string, userId: string, userRole: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog post not found!");

  // Author can delete their own | BATCH_ADMIN can delete from their batch | SUPER_ADMIN can delete anything
  if (
    blog.authorId !== userId &&
    userRole !== "SUPER_ADMIN" &&
    userRole !== "BATCH_ADMIN"
  ) {
    throw new AppError(403, "You do not have permission to delete this blog.");
  }

  await prisma.blog.delete({ where: { id } });
  return true;
};

const getPendingBlogs = async (batchId?: string) => {
  const where: any = { status: "PENDING" };
  if (batchId) where.batchId = batchId;

  return await prisma.blog.findMany({
    where,
    include: {
      author: {
        select: {
          email: true,
          studentProfile: { select: { fullName: true, profileImage: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const assertCanModerateBlog = async (
  blog: { batchId: string | null },
  userId: string,
  userRole: string
) => {
  if (userRole === "SUPER_ADMIN") return;
  if (userRole !== "BATCH_ADMIN") {
    throw new AppError(403, "You do not have permission to moderate this blog.");
  }
  const { batchId } = await getBatchAdminContext(userId);
  if (blog.batchId !== batchId) {
    throw new AppError(403, "You can only moderate blogs from your own batch.");
  }
};

const approveBlog = async (id: string, userId: string, userRole: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog post not found!");
  await assertCanModerateBlog(blog, userId, userRole);

  return await prisma.blog.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
};

const rejectBlog = async (id: string, userId: string, userRole: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog post not found!");
  await assertCanModerateBlog(blog, userId, userRole);

  return await prisma.blog.update({
    where: { id },
    data: { status: "REJECTED" },
  });
};

export const BlogService = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
};
