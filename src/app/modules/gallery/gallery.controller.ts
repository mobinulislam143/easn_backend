import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GalleryService } from "./gallery.service";

const getAllPhotos = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    type: req.query.type as string,
    batchId: req.query.batchId as string,
    eventId: req.query.eventId as string,
  };

  const result = await GalleryService.getAllPhotos(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gallery photos retrieved successfully",
    data: result,
  });
});

const uploadPhoto = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryService.uploadPhoto(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Photo uploaded to gallery successfully",
    data: result,
  });
});

const deletePhoto = catchAsync(async (req: Request, res: Response) => {
  await GalleryService.deletePhoto(req.params.id, req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Photo deleted from gallery successfully",
    data: null,
  });
});

export const GalleryController = {
  getAllPhotos,
  uploadPhoto,
  deletePhoto,
};
