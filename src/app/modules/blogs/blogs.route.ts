import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BlogController } from "./blogs.controller";
import { BlogValidation } from "./blogs.validation";

const router = Router();

router.get("/", BlogController.getAllBlogs);
router.get("/pending", auth("BATCH_ADMIN", "SUPER_ADMIN"), BlogController.getPendingBlogs);
router.get("/:id", BlogController.getBlogById);

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(BlogValidation.createBlogSchema),
  BlogController.createBlog
);

router.post("/:id/approve", auth("BATCH_ADMIN", "SUPER_ADMIN"), BlogController.approveBlog);
router.post("/:id/reject", auth("BATCH_ADMIN", "SUPER_ADMIN"), BlogController.rejectBlog);

router.put(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  validateRequest(BlogValidation.updateBlogSchema),
  BlogController.updateBlog
);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  BlogController.deleteBlog
);

export const BlogRoutes = router;
