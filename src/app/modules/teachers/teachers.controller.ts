import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TeacherService } from "./teachers.service";

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    subject: req.query.subject as string,
    status: req.query.status as any,
    search: req.query.search as string,
  };

  const result = await TeacherService.getAllTeachers(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teachers directory retrieved successfully",
    data: result,
  });
});

const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.getTeacherById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teacher profile retrieved successfully",
    data: result,
  });
});

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.createTeacher(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Teacher record created successfully",
    data: result,
  });
});

const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.updateTeacher(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teacher record updated successfully",
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
  await TeacherService.deleteTeacher(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teacher record deleted successfully",
    data: null,
  });
});

export const TeacherController = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
