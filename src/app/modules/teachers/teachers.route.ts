import { Router } from "express";
import auth from "../../middlewares/auth";
import { TeacherController } from "./teachers.controller";

const router = Router();

router.get("/", TeacherController.getAllTeachers);
router.get("/:id", TeacherController.getTeacherById);

router.post(
  "/",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  TeacherController.createTeacher
);

router.put(
  "/:id",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  TeacherController.updateTeacher
);

router.delete(
  "/:id",
  auth("SUPER_ADMIN"),
  TeacherController.deleteTeacher
);

export const TeacherRoutes = router;
