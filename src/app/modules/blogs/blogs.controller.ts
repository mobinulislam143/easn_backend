import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BlogService } from "./blogs.service";

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    category: req.query.category as any,
    search: req.query.search as string,
    tag: req.query.tag as string,
    isFeatured: req.query.isFeatured as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  };

  const result = await BlogService.getAllBlogs(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blogs retrieved successfully",
    data: result,
  });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog details retrieved successfully",
    data: result,
  });
});

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.createBlog(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Blog post published successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.updateBlog(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog post updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  await BlogService.deleteBlog(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog post deleted successfully",
    data: null,
  });
});

export const BlogController = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
