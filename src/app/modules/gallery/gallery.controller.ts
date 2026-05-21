import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getBatchAdminContext } from "../../helpers/batchAdmin";
import { GalleryService } from "./gallery.service";

const getAllPhotos = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    type: req.query.type as string,
    batchId: req.query.batchId as string,
    eventId: req.query.eventId as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  };
  const result = await GalleryService.getAllPhotos(filters);
  sendResponse(res, { statusCode: 200, success: true, message: "Gallery photos retrieved successfully", data: result });
});

const getPhotoById = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryService.getPhotoById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Photo retrieved successfully", data: result });
});

const uploadPhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryService.uploadPhoto(req.user!.id, req.body, req.user!.role);
  const isPending = (result as any).status === "PENDING";
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: isPending
      ? "Photo submitted! Awaiting batch admin approval."
      : "Photo uploaded to gallery successfully",
    data: result,
  });
});

const deletePhoto = catchAsync(async (req: Request, res: Response) => {
  await GalleryService.deletePhoto(req.params.id, req.user!.id, req.user!.role);
  sendResponse(res, { statusCode: 200, success: true, message: "Photo deleted from gallery successfully", data: null });
});

const getPendingPhotos = catchAsync(async (req: Request, res: Response) => {
  let batchId = req.query.batchId as string | undefined;
  if (req.user!.role === "BATCH_ADMIN") {
    const ctx = await getBatchAdminContext(req.user!.id);
    batchId = ctx.batchId;
  }
  const result = await GalleryService.getPendingPhotos(batchId);
  sendResponse(res, { statusCode: 200, success: true, message: "Pending photos retrieved", data: result });
});

const approvePhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryService.approvePhoto(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Photo approved and published", data: result });
});

const rejectPhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryService.rejectPhoto(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Photo rejected", data: result });
});

export const GalleryController = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  deletePhoto,
  getPendingPhotos,
  approvePhoto,
  rejectPhoto,
};
