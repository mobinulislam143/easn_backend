import { z } from "zod";

const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Blog title must be at least 5 characters"),
    content: z.string().min(50, "Blog content must be at least 50 characters"),
    category: z.enum(["REUNION", "CAREER", "MEMORIES", "SUCCESS_STORIES", "EDUCATION", "ANNOUNCEMENT", "ACHIEVEMENT", "GENERAL", "TECH"]),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters").optional(),
    featuredImage: z.string().url("Featured image must be a valid URL").optional(),
    tags: z.array(z.string()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
  }),
});

const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Blog title must be at least 5 characters").optional(),
    content: z.string().min(50, "Blog content must be at least 50 characters").optional(),
    category: z.enum(["REUNION", "CAREER", "MEMORIES", "SUCCESS_STORIES", "EDUCATION"]).optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters").optional(),
    featuredImage: z.string().url("Featured image must be a valid URL").optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const BlogValidation = {
  createBlogSchema,
  updateBlogSchema,
};
