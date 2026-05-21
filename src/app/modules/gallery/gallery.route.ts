import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GalleryController } from "./gallery.controller";
import { GalleryValidation } from "./gallery.validation";

const router = Router();

router.get("/", GalleryController.getAllPhotos);
router.get("/pending", auth("BATCH_ADMIN", "SUPER_ADMIN"), GalleryController.getPendingPhotos);
router.get("/:id", GalleryController.getPhotoById);

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(GalleryValidation.uploadPhotoSchema),
  GalleryController.uploadPhoto
);

router.post("/:id/approve", auth("BATCH_ADMIN", "SUPER_ADMIN"), GalleryController.approvePhoto);
router.post("/:id/reject", auth("BATCH_ADMIN", "SUPER_ADMIN"), GalleryController.rejectPhoto);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  GalleryController.deletePhoto
);

export const GalleryRoutes = router;
