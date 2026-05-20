import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NoticeService } from "./notices.service";

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = req.query.isAdmin === "true";
  const result = await NoticeService.getAllNotices({ isAdmin });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notices retrieved successfully",
    data: result,
  });
});

const getNoticeById = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.getNoticeById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notice retrieved successfully",
    data: result,
  });
});

const createNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.createNotice(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Notice published successfully",
    data: result,
  });
});

const updateNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.updateNotice(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notice updated successfully",
    data: result,
  });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
  await NoticeService.deleteNotice(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notice deleted successfully",
    data: null,
  });
});

export const NoticeController = {
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};
