import { Router } from "express";
import auth from "../../middlewares/auth";
import { GalleryController } from "./gallery.controller";

const router = Router();

router.get("/", GalleryController.getAllPhotos);

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  GalleryController.uploadPhoto
);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  GalleryController.deletePhoto
);

export const GalleryRoutes = router;
