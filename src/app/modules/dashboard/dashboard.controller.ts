import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getAdminSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAdminDashboardSummary();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard metrics loaded successfully",
    data: result,
  });
});

const getStudentSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getStudentDashboardSummary(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student dashboard metrics loaded successfully",
    data: result,
  });
});

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getNotifications(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "In-app notifications retrieved successfully",
    data: result,
  });
});

const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.markNotificationRead(req.params.id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const exportStudentsCsv = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    batch: req.query.batch as string,
    group: req.query.group as string,
    status: req.query.status as string,
  };

  const csvData = await DashboardService.getStudentsExportData(filters);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=students_export.csv");
  res.status(200).send(csvData);
});

const exportTeachersCsv = catchAsync(async (req: Request, res: Response) => {
  const csvData = await DashboardService.getTeachersExportData();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=teachers_export.csv");
  res.status(200).send(csvData);
});

const exportEventParticipantsCsv = catchAsync(async (req: Request, res: Response) => {
  const csvData = await DashboardService.getEventParticipantsExportData(req.params.id);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=event_participants_${req.params.id}.csv`);
  res.status(200).send(csvData);
});

export const DashboardController = {
  getAdminSummary,
  getStudentSummary,
  getNotifications,
  markNotificationRead,
  exportStudentsCsv,
  exportTeachersCsv,
  exportEventParticipantsCsv,
};
