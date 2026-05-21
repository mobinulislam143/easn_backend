import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { StudentController } from "./students.controller";
import { StudentValidation } from "./students.validation";

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
  validateRequest(StudentValidation.updateStudentProfileSchema),
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

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  StudentController.updateStudentByAdmin
);

router.post(
  "/:id/assign-event",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(StudentValidation.assignEventSchema),
  StudentController.assignEventToStudent
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN"),
  StudentController.deleteStudent
);

router.get("/:id", StudentController.getStudentById);

export const StudentRoutes = router;
