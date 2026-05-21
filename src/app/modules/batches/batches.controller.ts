import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BatchService } from "./batches.service";

const getAllBatches = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
  };
  const result = await BatchService.getAllBatches(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Batches list retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getBatchByYear = catchAsync(async (req: Request, res: Response) => {
  const result = await BatchService.getBatchByYear(req.params.year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Batch details and statistics retrieved successfully",
    data: result,
  });
});

const createBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await BatchService.createBatch(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Batch initialized successfully",
    data: result,
  });
});

const updateBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await BatchService.updateBatch(req.params.year, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Batch details updated successfully",
    data: result,
  });
});

const deleteBatch = catchAsync(async (req: Request, res: Response) => {
  await BatchService.deleteBatch(req.params.year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Batch deleted successfully",
    data: null,
  });
});

export const BatchController = {
  getAllBatches,
  getBatchByYear,
  createBatch,
  updateBatch,
  deleteBatch,
};
