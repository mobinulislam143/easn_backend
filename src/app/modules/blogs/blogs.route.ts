import { Router } from "express";
import auth from "../../middlewares/auth";
import { BlogController } from "./blogs.controller";

const router = Router();

router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getBlogById);

router.post(
  "/",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  BlogController.createBlog
);

router.put(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  BlogController.updateBlog
);

router.delete(
  "/:id",
  auth("STUDENT", "SUPER_ADMIN", "BATCH_ADMIN"),
  BlogController.deleteBlog
);

export const BlogRoutes = router;
