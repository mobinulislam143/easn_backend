import { Router } from "express";
import auth from "../../middlewares/auth";
import { StudentController } from "./students.controller";

const router = Router();

router.get(
  "/pending",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  StudentController.getPendingStudents
);

router.get("/directory", StudentController.getApprovedStudents);

router.get(
  "/profile",
  auth("STUDENT"),
  StudentController.getStudentProfile
);

router.put(
  "/profile",
  auth("STUDENT"),
  StudentController.updateStudentProfile
);

router.post(
  "/:id/approve",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  StudentController.approveStudent
);

router.post(
  "/:id/reject",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  StudentController.rejectStudent
);

router.get("/:id", StudentController.getStudentById);

export const StudentRoutes = router;
