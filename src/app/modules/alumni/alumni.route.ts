import { Router } from "express";
import auth from "../../middlewares/auth";
import { AlumniController } from "./alumni.controller";

const router = Router();

router.get("/", AlumniController.getAlumniDirectory);
router.get("/:id", AlumniController.getAlumniProfile);

router.put(
  "/profile",
  auth("STUDENT"),
  AlumniController.updateAlumniProfession
);

router.post(
  "/:id/feature",
  auth("SUPER_ADMIN", "BATCH_ADMIN"),
  AlumniController.toggleFeaturedAlumni
);

export const AlumniRoutes = router;
