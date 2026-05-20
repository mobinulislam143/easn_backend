import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CommentService } from "./comments.service";

const addComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.addComment(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  await CommentService.deleteComment(req.params.id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});

export const CommentController = {
  addComment,
  deleteComment,
};
