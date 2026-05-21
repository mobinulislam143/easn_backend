import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TeacherController } from "./teachers.controller";
import { TeacherValidation } from "./teachers.validation";

const router = Router();

router.get("/", TeacherController.getAllTeachers);
router.get("/:id", TeacherController.getTeacherById);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(TeacherValidation.createTeacherSchema),
  TeacherController.createTeacher
);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(TeacherValidation.updateTeacherSchema),
  TeacherController.updateTeacher
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN"),
  TeacherController.deleteTeacher
);

router.post(
  "/:id/create-account",
  auth("SUPER_ADMIN"),
  TeacherController.createTeacherAccount
);

export const TeacherRoutes = router;
