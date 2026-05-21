import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AlumniController } from "./alumni.controller";
import { AlumniValidation } from "./alumni.validation";

const router = Router();

router.get("/", AlumniController.getAlumniDirectory);
router.get("/:id", AlumniController.getAlumniProfile);

router.put(
  "/profile",
  auth("STUDENT"),
  validateRequest(AlumniValidation.updateAlumniProfileSchema),
  AlumniController.updateAlumniProfession
);

router.post(
  "/:id/feature",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  AlumniController.toggleFeaturedAlumni
);

export const AlumniRoutes = router;
