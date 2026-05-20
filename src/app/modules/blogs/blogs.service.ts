import prisma from "../../helpers/prisma";
import AppError from "../../errors/AppError";

const getAllBlogs = async (filters: any) => {
  const { category, search, tag, isFeatured } = filters;
  const whereConditions: any = {};

  if (category) {
    whereConditions.category = category;
  }
  if (isFeatured === "true" || isFeatured === true) {
    whereConditions.isFeatured = true;
  }
  if (tag) {
    whereConditions.tags = { has: tag };
  }
  if (search) {
    whereConditions.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.blog.findMany({
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
    orderBy: { createdAt: "desc" },
  });
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

  if (!blog) {
    throw new AppError(404, "Blog post not found!");
  }

  return blog;
};

const createBlog = async (userId: string, payload: any) => {
  return await prisma.blog.create({
    data: {
      title: payload.title,
      content: payload.content,
      banner: payload.banner || "",
      category: payload.category,
      tags: payload.tags || [],
      isFeatured: payload.isFeatured === true,
      authorId: userId,
    },
  });
};

const updateBlog = async (id: string, payload: any) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new AppError(404, "Blog post not found!");
  }

  return await prisma.blog.update({
    where: { id },
    data: {
      title: payload.title,
      content: payload.content,
      banner: payload.banner,
      category: payload.category,
      tags: payload.tags,
      isFeatured: payload.isFeatured,
    },
  });
};

const deleteBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new AppError(404, "Blog post not found!");
  }

  await prisma.blog.delete({
    where: { id },
  });

  return true;
};

export const BlogService = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
