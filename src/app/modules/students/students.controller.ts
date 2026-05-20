import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./students.service";

const getPendingStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getPendingStudents();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pending registrations retrieved successfully",
    data: result,
  });
});

const getApprovedStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    sscBatch: req.query.sscBatch as string,
    group: req.query.group as string,
    search: req.query.search as string,
    page: req.query.page as string,
    limit: req.query.limit as string,
  };

  const result = await StudentService.getApprovedStudents(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Approved students directory retrieved successfully",
    data: result,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getStudentById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student details retrieved successfully",
    data: result,
  });
});

const getStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getStudentByUserId(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student profile retrieved successfully",
    data: result,
  });
});

const updateStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.updateStudentProfile(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully!",
    data: result,
  });
});

const approveStudent = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.approveStudent(req.params.id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student approved successfully!",
    data: result,
  });
});

const rejectStudent = catchAsync(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const result = await StudentService.rejectStudent(req.params.id, req.user!.id, reason);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student registration request rejected.",
    data: result,
  });
});

export const StudentController = {
  getPendingStudents,
  getApprovedStudents,
  getStudentById,
  getStudentProfile,
  updateStudentProfile,
  approveStudent,
  rejectStudent,
};
