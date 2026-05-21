import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getBatchAdminContext } from "../../helpers/batchAdmin";
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
  sendResponse(res, { statusCode: 200, success: true, message: "Blogs retrieved successfully", data: result });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Blog details retrieved successfully", data: result });
});

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.createBlog(req.user!.id, req.body, req.user!.role);
  const isPending = (result as any).status === "PENDING";
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: isPending
      ? "Blog submitted! Awaiting batch admin approval."
      : "Blog post published successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.updateBlog(req.params.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Blog post updated successfully", data: result });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  await BlogService.deleteBlog(req.params.id, req.user!.id, req.user!.role);
  sendResponse(res, { statusCode: 200, success: true, message: "Blog post deleted successfully", data: null });
});

const getPendingBlogs = catchAsync(async (req: Request, res: Response) => {
  let batchId = req.query.batchId as string | undefined;
  if (req.user!.role === "BATCH_ADMIN") {
    const ctx = await getBatchAdminContext(req.user!.id);
    batchId = ctx.batchId;
  }
  const result = await BlogService.getPendingBlogs(batchId);
  sendResponse(res, { statusCode: 200, success: true, message: "Pending blogs retrieved", data: result });
});

const approveBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.approveBlog(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Blog approved and published", data: result });
});

const rejectBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.rejectBlog(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Blog rejected", data: result });
});

export const BlogController = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
};
