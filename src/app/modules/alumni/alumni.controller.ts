import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AlumniService } from "./alumni.service";

const getAlumniDirectory = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    sscBatch: req.query.sscBatch as string,
    group: req.query.group as string,
    profession: req.query.profession as string,
    company: req.query.company as string,
    role: req.query.role as string,
    isFeatured: req.query.isFeatured as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  };

  const result = await AlumniService.getAlumniDirectory(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alumni directory retrieved successfully",
    data: result,
  });
});

const getAlumniProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AlumniService.getAlumniProfile(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alumni profile retrieved successfully",
    data: result,
  });
});

const updateAlumniProfession = catchAsync(async (req: Request, res: Response) => {
  const result = await AlumniService.updateAlumniProfession(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alumni career details updated successfully",
    data: result,
  });
});

const toggleFeaturedAlumni = catchAsync(async (req: Request, res: Response) => {
  const result = await AlumniService.toggleFeaturedAlumni(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alumni featured status updated",
    data: result,
  });
});

export const AlumniController = {
  getAlumniDirectory,
  getAlumniProfile,
  updateAlumniProfession,
  toggleFeaturedAlumni,
};
