import { Router } from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";

const router = Router();

router.get(
  "/admin",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  DashboardController.getAdminSummary
);

router.get(
  "/student",
  auth("STUDENT"),
  DashboardController.getStudentSummary
);

router.get(
  "/notifications",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  DashboardController.getNotifications
);

router.post(
  "/notifications/:id/read",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  DashboardController.markNotificationRead
);

router.get(
  "/export/students",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  DashboardController.exportStudentsCsv
);

router.get(
  "/export/teachers",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  DashboardController.exportTeachersCsv
);

export const DashboardRoutes = router;
